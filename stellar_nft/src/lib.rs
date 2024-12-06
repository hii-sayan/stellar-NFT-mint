#![no_std]
#![feature(core_intrinsics)]

use soroban_sdk::{contractimpl, contracttype, Env, Address, Bytes, contract};

// Define the storage keys
#[contracttype]
enum DataKey {
    Admin,
    TokenOwner(u64), // Maps Token ID to Owner Address
    TokenURI(u64),   // Maps Token ID to Metadata URI
}

// Define the contract structure
#[derive(Debug)]
#[contract]
pub struct NFTContract;

#[contractimpl]
impl NFTContract {
    /// Initializes the contract with an admin address.
    pub fn initialize(env: Env, admin: Address) {
        let key = DataKey::Admin;
        if env.storage().instance().has(&key) {
            panic!("Contract is already initialized");
        }
        env.storage().instance().set(&key, &admin);
    }

    /// Mints a new NFT with a given token ID and metadata URI.
    pub fn mint(env: Env, to: Address, token_id: u64, metadata_uri: Bytes) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        if !admin.eq(&env.current_contract_address()) {
            panic!("Only the admin can mint NFTs");
        }

        let owner_key = DataKey::TokenOwner(token_id);
        let uri_key = DataKey::TokenURI(token_id);

        if env.storage().instance().has(&owner_key) {
            panic!("Token ID already exists");
        }

        env.storage().instance().set(&owner_key, &to);
        env.storage().instance().set(&uri_key, &metadata_uri);
    }

    /// Returns the owner of a specific token.
    pub fn owner_of(env: Env, token_id: u64) -> Address {
        let owner_key = DataKey::TokenOwner(token_id);
        env.storage()
            .instance()
            .get(&owner_key)
            .expect("Token ID does not exist")
    }

    /// Returns the metadata URI of a specific token.
    pub fn token_uri(env: Env, token_id: u64) -> Bytes {
        let uri_key = DataKey::TokenURI(token_id);
        env.storage()
            .instance()
            .get(&uri_key)
            .expect("Token ID does not exist")
    }

    /// Transfers ownership of an NFT to another address.
    pub fn transfer(env: Env, from: Address, to: Address, token_id: u64) {
        let owner_key = DataKey::TokenOwner(token_id);
        let current_owner: Address = env
            .storage()
            .instance()
            .get(&owner_key)
            .expect("Token ID does not exist");

        if !current_owner.eq(&from) {
            panic!("Only the current owner can transfer the token");
        }

        env.storage().instance().set(&owner_key, &to);
    }
}
