import "./Splitter.sol";

/// @title TokenSplitter
/// @author 0xcaff (Martin Charles)
/// @notice An ethereum smart contract to evenly split received ERC20 tokens and
/// ethereum between a number of outputs.
contract TokenSplitter is Splitter {
    // A mapping of token addresses to allowance of the token for an address.
    mapping (address => TokenInformation) tokenInformation;

    struct TokenInformation {
        mapping(address => uint) withdrawls;
        uint totalTokens;
    };

    // When tokens are sent to this contract using
    // token.transfer(contractAddress, valueToTransfer), the amount this
    // contract holds will only increase until withdraw is called. The contract
    // MUST not be able to transfer tokens out of the contract without going
    // through the withdraw function below.

    // TODO: finish me!!

    /// @notice Gets the balance change since the last withdrawl for the token.
    /// @param token The token to find the balance change of.
    /// @return The additional amount of token the contract holds since the last
    /// withdrawl.
    function getExtraBalance(BasicERC20Token token) constant returns (uint) {
        // this refers to the address of the contract. currentBalance is the
        // total balance of tokens for the contract according to the token
        // contract.
        uint currentBalance = token.balanceOf(this);

        // Get the state of the token after the last withdrawl.
        TokenInformation info = tokenInformation[address(token)];
        uint accountedBalance = info.totalTokens;

        // newBalance represents how much was added to the contract since the
        // last transaction.
        uint newBalance = accountedBalance - currentBalance;

        return newBalance;
    }

    /// @notice Gets the allowance of tokens the account is allowed to withdraw.
    /// @param token The token to check the balance of.
    /// @param account The address of the account to check the balance for.
    function balanceOf(BasicERC20Token token, address account) constant returns (uint) {
        uint extraFunds = TokenSplitter.getExtraBalance(token);

        TokenInformation info = tokenInformation[address(token)];
        uint lastAccountedBalance = info.totalTokens;

        uint currentTokenBalance = extraFunds + lastAccountedBalance;

        return shareOfExtra + lastAccountedBalance;
    }

    /// @notice Withdraws tokens from the contract to the sender.
    /// @param token The token to withdraw from the contract.
    /// @param amount The amount of the token to withdraw from the contract.
    function withdrawToken(BasicERC20Token token, uint amount) {
        uint extraFunds = TokenSplitter.getExtraBalance(token);

        // TODO: Implement
    }

    // TODO: Escape Hatch to withdraw directly from contracts
}

// An interface defining the parts of the ERC20 token which need to be
// implemented for the token to be handled by this contract.
interface BasicERC20Token {
    function balanceOf(address _owner) constant returns (uint balance);
    function transfer(address _to, uint _value) returns (bool success);
}
