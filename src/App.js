import React from 'react'

class App extends React.Component {
  constructor() {
    super()

    this.state = {
      companies: [],
      table: [],
      sorting: {
        id: undefined,
        name: undefined,
        city: undefined,
        sum: undefined,
        avg: undefined,
        last: undefined
      },
      inputs: {
        id: '',
        name: '',
        city: '',
        sum: '',
        avg: '',
        last: ''
      },
      pagination: {
        recordsPerPage: 10,
        pageNumber: 0
      }
    }

    this.putTableContentToState = this.putTableContentToState.bind(this)
    this.sortBy = this.sortBy.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.onSelectChange = this.onSelectChange.bind(this)
  }

  componentDidMount() {
    fetch('https://recruitment.hal.skygate.io/companies').then((res, rej) => { // get the list of all companies
      return res.json()
    }).then(async listOfCompanies => {
      return Promise.all(listOfCompanies.map(company => {
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
      }))
    }).then(() => {
      this.putTableContentToState()
    }).catch(err => console.log(err))
  }

  handleChange(e) {
    const target = e.target
    this.setState(state => {
      return {
        inputs: {
          ...state.inputs,
          [target.id]: target.value
        },
        pagination: {
          ...state.pagination,
          pageNumber: 0
        }
      }
    })
  }

  async putTableContentToState() {
    Promise.all(this.state.companies.map((company, i) => {
      this.setState((state) => {
        return {
          table: state.table.concat({
            id: company.id,
            name: company.name,
            city: company.city,
            sum: this.sumOfIncomes(company.incomes),
            avg: (this.sumOfIncomes(company.incomes) / company.incomes.length).toFixed(2),
            last: this.lastMonthIncome(company.incomes).toFixed(2)
          })
        }
      })
    }))
  }

  sortBy(element) {
    this.setState(state => {
      if(this.state.sorting[element] === 'asc') {
        return {
          table: state.table.sort((a, b) => (a[element] < b[element] ? 1 : -1)), //asc sort
          sorting: {
            [element]: 'desc'
          }
        }
      } else {
        return {
          table: state.table.sort((a, b) => (a[element] > b[element] ? 1 : -1)), //asc sort
          sorting: {
            [element]: 'asc'
          }
        }
      }
    })
  }

  onPageChange(e, button) {
    const records = this.state.pagination.recordsPerPage
    const pages = this.state.pagination.pageNumber
    
    e.preventDefault()
    if(button === 'gt' && (records*(pages+1)) < this.state.companies.length) {
      this.setState(state => ({
        pagination: {
          ...state.pagination,
          pageNumber: state.pagination.pageNumber+1
        }
      }))
    } else if(button === 'lt' && pages > 0) {
      this.setState(state => ({
        pagination: {
          ...state.pagination,
          pageNumber: state.pagination.pageNumber-1
        }
      }))
    }
  }

  onSelectChange(e) {
    const target = e.target
    this.setState(state => ({ 
      pagination: {
        ...state.pagination,
        recordsPerPage: target.value,
        pageNumber: 0
      }
    }))
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
    const records = this.state.pagination.recordsPerPage
    const pages = this.state.pagination.pageNumber

    const companies = this.state.table.filter(company => {
      return (
        company.id.toString().includes(this.state.inputs.id) &&
        company.name.toLowerCase().includes(this.state.inputs.name.toLowerCase()) &&
        company.city.toLowerCase().includes(this.state.inputs.city.toLowerCase()) &&
        company.sum.toLowerCase().includes(this.state.inputs.sum.toLowerCase()) &&
        company.avg.toLowerCase().includes(this.state.inputs.avg.toLowerCase()) &&
        company.last.toLowerCase().includes(this.state.inputs.last.toLowerCase())
      )
    }).map((company, i) => {
      if(i >= (records * pages) && i <= (records * (pages+1)-1)) {
        return (
          <tr>
            <td>{company.id}</td>
            <td>{company.name}</td>
            <td>{company.city}</td>
            <td>{company.sum}</td>
            <td>{company.avg}</td>
            <td>{company.last}</td>
          </tr>
        )
      }
    })

    return (
      <div>
        <table style={{border: '1px solid black'}}>
          <thead>
            <tr>
              <th onClick={() => this.sortBy('id')}>id</th>
              <th onClick={() => this.sortBy('name')}>name</th>
              <th onClick={() => this.sortBy('city')}>city</th>
              <th onClick={() => this.sortBy('sum')}>tot. income</th>
              <th onClick={() => this.sortBy('avg')}>avg. income</th>
              <th onClick={() => this.sortBy('last')}>last month income</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><input type='text' id='id' onChange={this.handleChange} /></td>
              <td><input type='text' id='name' onChange={this.handleChange} /></td>
              <td><input type='text' id='city' onChange={this.handleChange} /></td>
              <td><input type='text' id='sum' onChange={this.handleChange} /></td>
              <td><input type='text' id='avg' onChange={this.handleChange} /></td>
              <td><input type='text' id='last' onChange={this.handleChange} /></td>
            </tr>
            {companies}
            <tr>
              <td>
                <form>
                  <button onClick={(e) => this.onPageChange(e, 'lt')}>&lt;</button> 
                  <select name='recordsPerPage' onChange={this.onSelectChange} value={this.state.pagination.recordsPerPage}>
                    <option value='10'>10</option>
                    <option value='25'>25</option>
                    <option value='50'>50</option>
                    <option value='100'>100</option>
                  </select>
                  <button onClick={(e) => this.onPageChange(e, 'gt')}>&gt;</button>
                </form>
                {`(${(pages*records)+1}-${((pages+1)*records)})/${this.state.table.length}`}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }
}

export default App;
