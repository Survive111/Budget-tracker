import { useState, useEffect } from 'react'
import './App.css'
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF5252', '#8884d8', '#82ca9d']

function App() {
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('transactions')
    return saved ? JSON.parse(saved) : []
  })

  const [expenseCategories, setExpenseCategories] = useState(() => {
    const saved = localStorage.getItem('expenseCategories')
    return saved ? JSON.parse(saved) : ['Food', 'Taxi', 'Airtime', 'Groceries', 'Rent', 'Entertainment']
  })

  const [incomeCategories, setIncomeCategories] = useState(() => {
    const saved = localStorage.getItem('incomeCategories')
    return saved ? JSON.parse(saved) : ['Bursary', 'Part-time Job', 'Side Hustle', 'Family']
  })

  const [type, setType] = useState('expense')
  const [category, setCategory] = useState('Food')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')

  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false)
  const [newCategory, setNewCategory] = useState('')

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions))
  }, [transactions])

  useEffect(() => {
    localStorage.setItem('expenseCategories', JSON.stringify(expenseCategories))
  }, [expenseCategories])

  useEffect(() => {
    localStorage.setItem('incomeCategories', JSON.stringify(incomeCategories))
  }, [incomeCategories])

  const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0)
  const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0)
  const balance = income - expenses

  const currentCategories = type === 'expense' ? expenseCategories : incomeCategories

  // Group transactions by category for charts
  function getChartData(filterType) {
    const grouped = transactions
      .filter(t => t.type === filterType)
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Number(t.amount)
        return acc
      }, {})

    return Object.keys(grouped).map(cat => ({
      name: cat,
      value: grouped[cat]
    }))
  }

  const expenseChartData = getChartData('expense')
  const incomeChartData = getChartData('income')

  function handleTypeChange(newType) {
    setType(newType)
    setShowNewCategoryInput(false)
    setNewCategory('')
    setCategory(newType === 'expense' ? expenseCategories[0] : incomeCategories[0])
  }

  function handleCategoryChange(value) {
    if (value === '__add_new__') {
      setShowNewCategoryInput(true)
      setNewCategory('')
    } else {
      setCategory(value)
      setShowNewCategoryInput(false)
    }
  }

  function addNewCategory() {
    const trimmed = newCategory.trim()
    if (!trimmed) return
    if (currentCategories.includes(trimmed)) {
      setCategory(trimmed)
      setShowNewCategoryInput(false)
      return
    }

    if (type === 'expense') {
      setExpenseCategories([...expenseCategories, trimmed])
    } else {
      setIncomeCategories([...incomeCategories, trimmed])
    }
    setCategory(trimmed)
    setShowNewCategoryInput(false)
    setNewCategory('')
  }

  function deleteCategory(catToDelete) {
    if (type === 'expense') {
      const updated = expenseCategories.filter(c => c !== catToDelete)
      setExpenseCategories(updated)
      setCategory(updated[0] || '')
    } else {
      const updated = incomeCategories.filter(c => c !== catToDelete)
      setIncomeCategories(updated)
      setCategory(updated[0] || '')
    }
  }

  function addTransaction(e) {
    e.preventDefault()
    if (!amount || !category) return

    const newTx = {
      id: Date.now(),
      type,
      category,
      amount: Number(amount),
      note,
      date: new Date().toLocaleDateString()
    }

    setTransactions([newTx, ...transactions])
    setAmount('')
    setNote('')
  }

  function deleteTx(id) {
    setTransactions(transactions.filter(t => t.id !== id))
  }

  function renderChart(title, data) {
    if (data.length === 0) return null
    return (
      <div className="card chart-card">
        <h3>{title}</h3>
        <PieChart width={340} height={280} style={{ margin: '0 auto' }}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={90}
            label={(entry) => `${entry.name}: R${entry.value}`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `R ${value}`} />
          <Legend />
        </PieChart>
      </div>
    )
  }

  return (
    <div className="container">
      <h1>Budget Tracker</h1>

      <div className="summary">
        <div className="card balance">
          <p>Balance</p>
          <h2>R {balance.toFixed(2)}</h2>
        </div>
        <div className="card income">
          <p>Income</p>
          <h2>R {income.toFixed(2)}</h2>
        </div>
        <div className="card expense">
          <p>Expenses</p>
          <h2>R {expenses.toFixed(2)}</h2>
        </div>
      </div>

      <div className="charts">
        {renderChart('Where Your Money Goes', expenseChartData)}
        {renderChart('Where Your Money Comes From', incomeChartData)}
      </div>

      <form onSubmit={addTransaction} className="form">
        <div className="form-row">
          <select value={type} onChange={e => handleTypeChange(e.target.value)}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>

          <select value={showNewCategoryInput ? '__add_new__' : category} onChange={e => handleCategoryChange(e.target.value)}>
            {currentCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
            <option value="__add_new__">+ Add New Category...</option>
          </select>
        </div>

        {showNewCategoryInput && (
          <div className="form-row" style={{ marginTop: '10px' }}>
            <input
              placeholder={`New ${type} category e.g. ${type === 'expense' ? 'Data' : 'Allowance'}`}
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              autoFocus
            />
            <button type="button" onClick={addNewCategory}>Save Category</button>
            <button type="button" onClick={() => setShowNewCategoryInput(false)}>Cancel</button>
          </div>
        )}

        {!showNewCategoryInput && category && (
          <div style={{ fontSize: '12px', marginTop: '5px', textAlign: 'right' }}>
            <button type="button" onClick={() => deleteCategory(category)} style={{ background: 'none', border: 'none', color: '#ff5252', cursor: 'pointer' }}>
              Delete "{category}" category
            </button>
          </div>
        )}

        <input
          type="number"
          placeholder="Amount (R)"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          required
        />
        <input
          placeholder="Note e.g. Taxi to town"
          value={note}
          onChange={e => setNote(e.target.value)}
        />
        <button type="submit">+ Add Transaction</button>
      </form>

      <p className="list-header">Recent Transactions</p>
      <div className="list">
        {transactions.length === 0 && (
          <p className="empty">No transactions yet. Add your first one above!</p>
        )}
        {transactions.map(t => (
          <div key={t.id} className={`item ${t.type}`}>
            <div className="item-left">
              <strong>{t.category}</strong> <span>— {t.note}</span>
              <small>{t.date}</small>
            </div>
            <div className="item-right">
              <strong>{t.type === 'income' ? '+' : '-'} R {t.amount}</strong>
              <button onClick={() => deleteTx(t.id)}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App