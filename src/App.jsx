import { useState, useEffect } from 'react'
import './App.css'

function App() {
  // Load from localStorage so it doesn't disappear on refresh
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('transactions')
    return saved ? JSON.parse(saved) : []
  })

  const [type, setType] = useState('expense')
  const [category, setCategory] = useState('Food')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')

  // Save every time transactions change
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions))
  }, [transactions])

  const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0)
  const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0)
  const balance = income - expenses

  function addTransaction(e) {
    e.preventDefault()
    if (!amount) return

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

  return (
    <div className="container">
      <h1>💰 My Budget - SA</h1>

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

      <form onSubmit={addTransaction} className="form">
        <select value={type} onChange={e => setType(e.target.value)}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>

        <select value={category} onChange={e => setCategory(e.target.value)}>
          {type === 'expense' ? (
            <>
              <option>Food</option>
              <option>Taxi</option>
              <option>Airtime</option>
              <option>Groceries</option>
              <option>Rent</option>
              <option>Entertainment</option>
            </>
          ) : (
            <>
              <option>Bursary</option>
              <option>Part-time Job</option>
              <option>Side Hustle</option>
              <option>Family</option>
            </>
          )}
        </select>

        <input
          type="number"
          placeholder="Amount R"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          required
        />
        <input
          placeholder="Note e.g. Taxi to town"
          value={note}
          onChange={e => setNote(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>

      <div className="list">
        {transactions.length === 0 && <p>No transactions yet. Add your first one above!</p>}
        {transactions.map(t => (
          <div key={t.id} className={`item ${t.type}`}>
            <div>
              <strong>{t.category}</strong> <span>- {t.note}</span>
              <br/><small>{t.date}</small>
            </div>
            <div>
              <strong>{t.type === 'income' ? '+' : '-'} R {t.amount}</strong>
              <button onClick={() => deleteTx(t.id)}>❌</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
