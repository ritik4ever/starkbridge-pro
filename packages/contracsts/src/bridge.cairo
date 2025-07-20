use starknet::ContractAddress;

#[starknet::interface]
trait IBridge<TContractState> {
    fn initialize(ref self: TContractState, owner: ContractAddress, fee_collector: ContractAddress);
    fn bridge_to_l1(ref self: TContractState, token: ContractAddress, amount: u256, l1_recipient: felt252);
    fn bridge_from_l1(ref self: TContractState, token: ContractAddress, amount: u256, recipient: ContractAddress);
    fn set_fee_rate(ref self: TContractState, new_rate: u256);
    fn withdraw_fees(ref self: TContractState, token: ContractAddress, amount: u256);
    fn pause(ref self: TContractState);
    fn unpause(ref self: TContractState);
    fn get_fee_rate(self: @TContractState) -> u256;
    fn get_total_bridged(self: @TContractState, token: ContractAddress) -> u256;
    fn is_paused(self: @TContractState) -> bool;
}

#[starknet::contract]
mod Bridge {
    use super::IBridge;
    use starknet::{
        ContractAddress, get_caller_address, get_contract_address, contract_address_const
    };
    use openzeppelin::access::ownable::Ownable;
    use openzeppelin::security::pausable::Pausable;
    use openzeppelin::token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};

    #[storage]
    struct Storage {
        fee_rate: u256,
        fee_collector: ContractAddress,
        total_bridged: LegacyMap<ContractAddress, u256>,
        nonce: u256,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        BridgeToL1: BridgeToL1,
        BridgeFromL1: BridgeFromL1,
        FeeRateUpdated: FeeRateUpdated,
        FeesWithdrawn: FeesWithdrawn,
    }

    #[derive(Drop, starknet::Event)]
    struct BridgeToL1 {
        #[key]
        token: ContractAddress,
        #[key]
        sender: ContractAddress,
        amount: u256,
        fee: u256,
        l1_recipient: felt252,
        nonce: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct BridgeFromL1 {
        #[key]
        token: ContractAddress,
        #[key]
        recipient: ContractAddress,
        amount: u256,
        nonce: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct FeeRateUpdated {
        old_rate: u256,
        new_rate: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct FeesWithdrawn {
        #[key]
        token: ContractAddress,
        amount: u256,
        recipient: ContractAddress,
    }

    mod Errors {
        const INVALID_AMOUNT: felt252 = 'Invalid amount';
        const INSUFFICIENT_BALANCE: felt252 = 'Insufficient balance';
        const TRANSFER_FAILED: felt252 = 'Transfer failed';
        const INVALID_FEE_RATE: felt252 = 'Invalid fee rate';
        const ZERO_ADDRESS: felt252 = 'Zero address';
    }

    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress, fee_collector: ContractAddress) {
        self.ownable.initializer(owner);
        self.pausable.initializer();
        self.fee_rate.write(300); // 3% initial fee rate (300 basis points)
        self.fee_collector.write(fee_collector);
        self.nonce.write(0);
    }

    #[abi(embed_v0)]
    impl BridgeImpl of IBridge<ContractState> {
        fn initialize(ref self: ContractState, owner: ContractAddress, fee_collector: ContractAddress) {
            self.ownable.initializer(owner);
            self.pausable.initializer();
            self.fee_collector.write(fee_collector);
        }

        fn bridge_to_l1(
            ref self: ContractState,
            token: ContractAddress,
            amount: u256,
            l1_recipient: felt252
        ) {
            self.pausable.assert_not_paused();
            assert(amount > 0, Errors::INVALID_AMOUNT);
            assert(token != contract_address_const::<0>(), Errors::ZERO_ADDRESS);

            let caller = get_caller_address();
            let this_contract = get_contract_address();
            
            // Calculate fee
            let fee_rate = self.fee_rate.read();
            let fee = (amount * fee_rate) / 10000; // basis points
            let amount_after_fee = amount - fee;

            // Transfer tokens from user to contract
            let token_contract = IERC20Dispatcher { contract_address: token };
            let success = token_contract.transfer_from(caller, this_contract, amount);
            assert(success, Errors::TRANSFER_FAILED);

            // Transfer fee to fee collector
            if fee > 0 {
                let fee_collector = self.fee_collector.read();
                let fee_success = token_contract.transfer(fee_collector, fee);
                assert(fee_success, Errors::TRANSFER_FAILED);
            }

            // Update total bridged amount
            let current_total = self.total_bridged.read(token);
            self.total_bridged.write(token, current_total + amount_after_fee);

            // Increment nonce
            let current_nonce = self.nonce.read();
            let new_nonce = current_nonce + 1;
            self.nonce.write(new_nonce);

            // Emit event
            self.emit(BridgeToL1 {
                token,
                sender: caller,
                amount: amount_after_fee,
                fee,
                l1_recipient,
                nonce: new_nonce,
            });
        }

        fn bridge_from_l1(
            ref self: ContractState,
            token: ContractAddress,
            amount: u256,
            recipient: ContractAddress
        ) {
            self.ownable.assert_only_owner();
            self.pausable.assert_not_paused();
            assert(amount > 0, Errors::INVALID_AMOUNT);
            assert(recipient != contract_address_const::<0>(), Errors::ZERO_ADDRESS);

            // Transfer tokens to recipient
            let token_contract = IERC20Dispatcher { contract_address: token };
            let success = token_contract.transfer(recipient, amount);
            assert(success, Errors::TRANSFER_FAILED);

            // Increment nonce
            let current_nonce = self.nonce.read();
            let new_nonce = current_nonce + 1;
            self.nonce.write(new_nonce);

            // Emit event
            self.emit(BridgeFromL1 {
                token,
                recipient,
                amount,
                nonce: new_nonce,
            });
        }

        fn set_fee_rate(ref self: ContractState, new_rate: u256) {
            self.ownable.assert_only_owner();
            assert(new_rate <= 1000, Errors::INVALID_FEE_RATE); // Max 10%

            let old_rate = self.fee_rate.read();
            self.fee_rate.write(new_rate);

            self.emit(FeeRateUpdated { old_rate, new_rate });
        }

        fn withdraw_fees(ref self: ContractState, token: ContractAddress, amount: u256) {
            self.ownable.assert_only_owner();
            assert(amount > 0, Errors::INVALID_AMOUNT);

            let fee_collector = self.fee_collector.read();
            let token_contract = IERC20Dispatcher { contract_address: token };
            let success = token_contract.transfer(fee_collector, amount);
            assert(success, Errors::TRANSFER_FAILED);

            self.emit(FeesWithdrawn {
                token,
                amount,
                recipient: fee_collector,
            });
        }

        fn pause(ref self: ContractState) {
            self.ownable.assert_only_owner();
            self.pausable.pause();
        }

        fn unpause(ref self: ContractState) {
            self.ownable.assert_only_owner();
            self.pausable.unpause();
        }

        fn get_fee_rate(self: @ContractState) -> u256 {
            self.fee_rate.read()
        }

        fn get_total_bridged(self: @ContractState, token: ContractAddress) -> u256 {
            self.total_bridged.read(token)
        }

        fn is_paused(self: @ContractState) -> bool {
            self.pausable.is_paused()
        }
    }

    #[abi(embed_v0)]
    impl OwnableImpl = Ownable::OwnableImpl<ContractState>;

    #[abi(embed_v0)]
    impl PausableImpl = Pausable::PausableImpl<ContractState>;
}