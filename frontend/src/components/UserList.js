import  React, { Component } from  'react';
import  UsersService  from  '../components/UserService';

const  usersService  =  new  UsersService();

class  UsersList  extends  Component {

constructor(props) {
	super(props);
	this.state  = {
		customers: [],
		nextPageURL:  ''
	};
	this.nextPage  =  this.nextPage.bind(this);
	this.handleDelete  =  this.handleDelete.bind(this);
}

componentDidMount() {
	var  self  =  this;
	usersService.getUsers().then(function (result) {
		console.log(result);
		self.setState({ customers:  result.data, nextPageURL:  result.nextlink})
	});
}
handleDelete(e,pk){
	var  self  =  this;
	usersService.deleteUser({pk :  pk}).then(()=>{
		var  newArr  =  self.state.customers.filter(function(obj) {
			return  obj.pk  !==  pk;
		});
		
		self.setState({customers:  newArr})
	});
}

nextPage(){
	var  self  =  this;
	console.log(this.state.nextPageURL);		
	usersService.getUsersByURL(this.state.nextPageURL).then((result) => {
		self.setState({ customers:  result.data, nextPageURL:  result.nextlink})
	});
}
render() {

	return (
		<div  className="customers--list">
			<table  className="table">
			<thead  key="thead">
			<tr>
				<th>#</th>
				<th>User name</th>
				<th>Email</th>
				<th>Token</th>
			</tr>
			</thead>
			<tbody>
			{this.state.customers.map( c  =>
				<tr  key={c.pk}>
				<td>{c.pk}  </td>
				<td>{c.username}</td>
				<td>{c.email}</td>
				<td>{c.token_monobank}</td>
				<td>
				<button  onClick={(e)=>  this.handleDelete(e,c.pk) }> Delete</button>
				<a  href={"/user/" + c.pk}> Update</a>
				</td>
			</tr>)}
			</tbody>
			</table>
			<button  className="btn btn-primary"  onClick=  {  this.nextPage  }>Next</button>
		</div>
		);
  }
}
export  default  UsersList;