import React from 'react'

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
      listOfCompanies.map(company => {
        return fetch(`https://recruitment.hal.skygate.io/incomes/${company.id}`).then((res, rej) => { // fetch the incomes of a specific company
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

  sumOfIncomes(incomes) {
    const sum = incomes.reduce((acc, income) => {
      return acc + parseFloat(income.value)
    }, 0)
    return (Math.round(sum * 100) / 100).toFixed(2) //round up to 2 dec points, then print 2 dec points always
  }

  lastMonthIncome(incomes) {
    const now = new Date(Date.now())
    const monthTwoDigits = now.getMonth() <= 9 ? `0${now.getMonth()}` : now.getMonth()
    const lastMonthRegex = `^${now.getFullYear()}-${monthTwoDigits-1}` //returns if string begins with '2020-03' or today's equivalent
    return incomes.reduce((acc, income) => {
      if(income.date.match(lastMonthRegex)) {
        return acc + parseFloat(income.value)
      } else return acc
    }, 0)
  }

  render() {
    const companies = this.state.companies.map((company, i) => {
      return (
        <tr key={company.id}>
          <td>{company.id}</td>
          <td>{company.name}</td>
          <td>{company.city}</td>
          <td>{this.sumOfIncomes(company.incomes)}</td>
          <td>{(this.sumOfIncomes(company.incomes) / company.incomes.length).toFixed(2)}</td>
          <td>{this.lastMonthIncome(company.incomes)}</td>
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
