pragma solidity ^0.5.0 ;

contract ERC20 {

  string public name = "DappToken";
  string public symbol = "DAPP";
  string public standard = "DApp Token v1.0";

  uint256 public totalSupply;

  event Transfer(
    address indexed _from,
    address indexed _to,
    uint256 _value
  );

  event Approval(
    address indexed _owner,
    address indexed _spender,
    uint256 _value
  );

  mapping (address => uint256) public balanceOf ;
  mapping (address => mapping(address => uint256)) public allowance;

  constructor (uint256 _initialSupply) public {
    balanceOf[msg.sender] = _initialSupply;
    totalSupply = _initialSupply;
  }

  // Transfer
  function transfer(address _to, uint256 _value) public returns(bool success) {
    require(
      balanceOf[msg.sender]>=_value,
      "need balance >= _value"
    );

    balanceOf[msg.sender] -= _value;
    balanceOf[_to] += _value;

    emit Transfer(msg.sender, _to, _value);

    return true;
  }

  //Delegated Transfer

  //approve
  function approve(address _spender, uint256 _value) public returns(bool success){

    allowance[msg.sender][_spender] = _value;

    emit Approval(msg.sender, _spender, _value);

    return true;
  }

  //tranferFrom
  function transferFrom(address _from, address _to, uint256 _value) public returns(bool success){
    // require _from has enough tokens
    require(
      _value <= balanceOf[_from],
      "require _from has enough tokens"
    );

    // require allowance is big enough
    require(
      _value <= allowance[_from][msg.sender],
      "require allowance is big enough"
    );

    // change the balance
    balanceOf[_from] -= _value;
    // update the balance
    balanceOf[_to] += _value;

    allowance[_from][msg.sender] -= _value;
    // transfer event
    emit Transfer(_from,_to,_value);
    // return a boolean
    return true;
  }
}