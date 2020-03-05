import React from 'react';
import update from 'immutability-helper'
import _ from 'lodash'

class App extends React.Component {
  constructor() {
    super()

    this.state = {
      companies: []
    }
  }

  componentDidMount() {
    fetch('https://recruitment.hal.skygate.io/companies').then((res, rej) => { // get the list of all companies
      return res.json()
    }).then(listOfCompanies => {
      listOfCompanies.map(company => { // map through all companies
        fetch(`https://recruitment.hal.skygate.io/incomes/${company.id}`).then((res, rej) => { // fetch the incomes of a specific company
          return res.json()
        }).then(companyIncomes => {
          const listOfCompaniesMatchedCompany = listOfCompanies.filter(company => { // filter list of companies...
            return company.id === companyIncomes.id // ...to match only when its id equls the id of incomes from a specific company
          })[0] // turn 1-element array into object

          this.setState(state => ({
            companies: [...state.companies, {...listOfCompaniesMatchedCompany, ...companyIncomes}] // spread both pieces to create one joint object
          }))
        })
      })
    }).catch(err => console.log(err))
  }

  render() {
    const companies = this.state.companies.map(company => {
      return (
        <tr key={company.id}>
          <td>{company.id}</td>
          <td>{company.name}</td>
          <td>{company.city}</td>
          <td>TBD</td>
          <td>TBD</td>
          <td>TBD</td>
        </tr>
      )
    })

    return (
      <div>
        <table style={{border: '1px solid black'}}>
          <thead>
            <tr>
              <th>ID</th>
              <th>City</th>
              <th>Name</th>
              <th>total income</th>
              <th>avg income</th>
              <th>last month income</th>
            </tr>
          </thead>
          <tbody>
            {companies}
          </tbody>
        </table>
      </div>
    )
  }
}

export default App;
