
import { useEffect, useState } from 'react'
import './App.css'

const CATEGORIES = [
  'Gıda', 'Maaş', 'Faturalar', 'Kira', 'Ulaşım',
  'Eğitim', 'Sağlık', 'Eğlence', 'Alışveriş', 'Diğer'
]

const EXPENSE_CATEGORIES = [
  'Gıda', 'Faturalar', 'Kira', 'Ulaşım',
  'Eğitim', 'Sağlık', 'Eğlence', 'Alışveriş', 'Diğer'
]

const initialTransactions = [
  { id: 1, title: 'Market Alışverişi', category: 'Gıda', type: 'expense', amount: 2500, date: '2026-10-30' },
  { id: 2, title: 'Maaş', category: 'Maaş', type: 'income', amount: 35000, date: '2026-10-28' },
  { id: 3, title: 'Elektrik Faturası', category: 'Faturalar', type: 'expense', amount: 1200, date: '2026-10-25' }
]

const initialBudgets = {
  'Gıda': 10000,
  'Faturalar': 5000,
  'Kira': 15000,
  'Ulaşım': 3000,
  'Eğitim': 3000,
  'Sağlık': 2000,
  'Eğlence': 2500,
  'Alışveriş': 3000,
  'Diğer': 3000
}

function getToday() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatMoney(amount) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 2
  }).format(amount)
}

function formatDate(date) {
  return new Date(date + 'T12:00:00').toLocaleDateString('tr-TR')
}

function getSavedData(key, initialValue) {
  try {
    const saved = localStorage.getItem(key)
    return saved !== null ? JSON.parse(saved) : initialValue
  } catch {
    return initialValue
  }
}

function App() {
  // Ana sayfa seçimi
  const [activePage, setActivePage] = useState('dashboard')

  // Kayıtlı işlemler
  const [transactions, setTransactions] = useState(() =>
    getSavedData('ailebutce-transactions', initialTransactions)
  )

  // Aylık bütçe limitleri
  const [budgets, setBudgets] = useState(() =>
    getSavedData('ailebutce-budgets', initialBudgets)
  )

  // Tasarruf hedefleri
  const [goals, setGoals] = useState(() =>
    getSavedData('ailebutce-goals', [])
  )

  // İşlem formu
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Gıda')
  const [type, setType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(getToday())

  // İşlem arama ve filtreleme
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterMonth, setFilterMonth] = useState('all')

  // Bütçe ayı
  const [budgetMonth, setBudgetMonth] = useState(getToday().slice(0, 7))

  // Tasarruf hedefi formu
  const [goalTitle, setGoalTitle] = useState('')
  const [goalTarget, setGoalTarget] = useState('')

  // Verileri tarayıcıya kaydet
  useEffect(() => {
    localStorage.setItem('ailebutce-transactions', JSON.stringify(transactions))
  }, [transactions])

  useEffect(() => {
    localStorage.setItem('ailebutce-budgets', JSON.stringify(budgets))
  }, [budgets])

  useEffect(() => {
    localStorage.setItem('ailebutce-goals', JSON.stringify(goals))
  }, [goals])

  // Seçilen ayın işlemleri
  const monthlyTransactions = transactions.filter(
    (item) => item.date.slice(0, 7) === budgetMonth
  )

  // Seçilen ayın gelirleri
  const monthlyIncome = monthlyTransactions
    .filter((item) => item.type === 'income')
    .reduce((sum, item) => sum + item.amount, 0)

  // Seçilen ayın giderleri
  const monthlyExpense = monthlyTransactions
    .filter((item) => item.type === 'expense')
    .reduce((sum, item) => sum + item.amount, 0)

  // Bütün zamanların gelir ve giderleri
  const totalIncome = transactions
    .filter((item) => item.type === 'income')
    .reduce((sum, item) => sum + item.amount, 0)

  const totalExpense = transactions
    .filter((item) => item.type === 'expense')
    .reduce((sum, item) => sum + item.amount, 0)

  const balance = totalIncome - totalExpense

  // İşlem formunu temizle
  function resetTransactionForm() {
    setTitle('')
    setCategory('Gıda')
    setType('expense')
    setAmount('')
    setDate(getToday())
    setEditingId(null)
    setShowForm(false)
  }

  // İşlem ekle veya düzenle
  function handleSaveTransaction(event) {
    event.preventDefault()

    if (!title.trim() || !amount || Number(amount) <= 0 || !date) {
      alert('Lütfen bütün alanları doğru şekilde doldurun.')
      return
    }

    const transactionData = {
      title: title.trim(),
      category,
      type,
      amount: Number(amount),
      date
    }

    if (editingId !== null) {
      setTransactions((previous) =>
        previous.map((item) =>
          item.id === editingId
            ? { ...item, ...transactionData }
            : item
        )
      )
    } else {
      setTransactions((previous) => [
        { id: Date.now(), ...transactionData },
        ...previous
      ])
    }

    resetTransactionForm()
  }

  // Düzenleme formunu doldur
  function handleEditTransaction(transaction) {
    setTitle(transaction.title)
    setCategory(transaction.category)
    setType(transaction.type)
    setAmount(String(transaction.amount))
    setDate(transaction.date)
    setEditingId(transaction.id)
    setShowForm(true)
    setActivePage('transactions')
  }

  // İşlem sil
  function handleDeleteTransaction(id) {
    if (!window.confirm('Bu işlemi silmek istediğinize emin misiniz?')) {
      return
    }

    setTransactions((previous) =>
      previous.filter((item) => item.id !== id)
    )

    if (editingId === id) {
      resetTransactionForm()
    }
  }

  // Yeni tasarruf hedefi oluştur
  function handleAddGoal(event) {
    event.preventDefault()

    if (!goalTitle.trim() || !goalTarget || Number(goalTarget) <= 0) {
      alert('Lütfen hedef adını ve geçerli bir tutar girin.')
      return
    }

    setGoals((previous) => [
      ...previous,
      {
        id: Date.now(),
        title: goalTitle.trim(),
        target: Number(goalTarget),
        current: 0
      }
    ])

    setGoalTitle('')
    setGoalTarget('')
  }

  // Tasarruf hedefine para ekle
  function handleAddSaving(goal) {
    const value = window.prompt(
      `${goal.title} hedefine eklenecek tutarı girin (TL):`
    )

    if (value === null) return

    const saving = Number(value.replace(',', '.'))

    if (!Number.isFinite(saving) || saving <= 0) {
      alert('Lütfen geçerli ve sıfırdan büyük bir tutar girin.')
      return
    }

    setGoals((previous) =>
      previous.map((item) =>
        item.id === goal.id
          ? { ...item, current: item.current + saving }
          : item
      )
    )
  }

  // Tasarruf hedefini sil
  function handleDeleteGoal(id) {
    if (!window.confirm('Bu tasarruf hedefini silmek istiyor musunuz?')) {
      return
    }

    setGoals((previous) => previous.filter((goal) => goal.id !== id))
  }

  // İşlem listesini filtrele
  const filteredTransactions = transactions
    .filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase())

      const matchesType =
        filterType === 'all' || item.type === filterType

      const matchesMonth =
        filterMonth === 'all' || item.date.slice(0, 7) === filterMonth

      return matchesSearch && matchesType && matchesMonth
    })
    .sort((a, b) => b.date.localeCompare(a.date))

  // Bütçe kategorisinin harcaması
  function getCategoryExpense(categoryName) {
    return monthlyTransactions
      .filter(
        (item) =>
          item.type === 'expense' && item.category === categoryName
      )
      .reduce((sum, item) => sum + item.amount, 0)
  }

  // Bütçe limitini değiştir
  function handleBudgetChange(categoryName, value) {
    setBudgets((previous) => ({
      ...previous,
      [categoryName]: value === '' ? '' : Number(value)
    }))
  }

  // Sayfa başlığı
  const pageTitles = {
    dashboard: 'Genel Bakış',
    transactions: 'Gelir ve Giderler',
    budget: 'Aylık Bütçe Planı',
    goals: 'Tasarruf Hedefleri'
  }

  return (
    <div className="app">

      {/* SOL MENÜ */}
      <aside className="sidebar">
        <h2 className="logo">AileBütçe<span>.</span></h2>

        <p className="menu-label">MENÜ</p>

        <nav>
          <button
            className={activePage === 'dashboard' ? 'nav-link active' : 'nav-link'}
            onClick={() => setActivePage('dashboard')}
          >
            <span>▦</span> Genel Bakış
          </button>

          <button
            className={activePage === 'transactions' ? 'nav-link active' : 'nav-link'}
            onClick={() => setActivePage('transactions')}
          >
            <span>↔</span> Gelir ve Giderler
          </button>

          <button
            className={activePage === 'budget' ? 'nav-link active' : 'nav-link'}
            onClick={() => setActivePage('budget')}
          >
            <span>▤</span> Bütçe Planı
          </button>

          <button
            className={activePage === 'goals' ? 'nav-link active' : 'nav-link'}
            onClick={() => setActivePage('goals')}
          >
            <span>◎</span> Tasarruf Hedefleri
          </button>
        </nav>

        <div className="sidebar-note">
          <span>💜</span>
          <p>Ailenizin bütçesi, tek bir yerde.</p>
        </div>
      </aside>

      {/* ANA İÇERİK */}
      <main className="main-content">

        <header className="topbar">
          <div>
            <h1>{pageTitles[activePage]}</h1>
            <p>Ailenizin bütçesini birlikte yönetin.</p>
          </div>

          <div className="user-info">
            <span className="family-avatar">👨‍👩‍👧‍👦</span>
            <span>Aile Hesabı</span>
          </div>
        </header>

        {/* GENEL BAKIŞ */}
        {activePage === 'dashboard' && (
          <>
            <section className="summary">
              <div className="summary-card balance-card">
                <div className="card-icon">💜</div>
                <p>Toplam Bakiye</p>
                <h2>{formatMoney(balance)}</h2>
                <small>Bütün kayıtlı işlemler</small>
              </div>

              <div className="summary-card income-card">
                <div className="card-icon">↗</div>
                <p>Toplam Gelir</p>
                <h2>{formatMoney(totalIncome)}</h2>
                <small>Kaydedilen tüm gelirler</small>
              </div>

              <div className="summary-card expense-card">
                <div className="card-icon">↙</div>
                <p>Toplam Gider</p>
                <h2>{formatMoney(totalExpense)}</h2>
                <small>Kaydedilen tüm giderler</small>
              </div>
            </section>

            <section className="monthly-overview">
              <div>
                <h2>Bu Ayın Özeti</h2>
                <p>Seçilen aya ait gelir ve giderler</p>
              </div>

              <input
                className="month-input"
                type="month"
                value={budgetMonth}
                onChange={(event) => setBudgetMonth(event.target.value)}
              />

              <div className="month-stats">
                <div>
                  <span>Bu Ay Gelir</span>
                  <strong className="income">{formatMoney(monthlyIncome)}</strong>
                </div>

                <div>
                  <span>Bu Ay Gider</span>
                  <strong className="expense">{formatMoney(monthlyExpense)}</strong>
                </div>

                <div>
                  <span>Ay Sonu Farkı</span>
                  <strong>{formatMoney(monthlyIncome - monthlyExpense)}</strong>
                </div>
              </div>
            </section>

            <section className="transactions">
              <div className="section-heading">
                <div>
                  <h2>Son İşlemler</h2>
                  <p>En son eklenen gelir ve giderler</p>
                </div>

                <button
                  className="primary-button"
                  onClick={() => {
                    resetTransactionForm()
                    setActivePage('transactions')
                    setShowForm(true)
                  }}
                >
                  + Yeni İşlem
                </button>
              </div>

              {transactions.length === 0 ? (
                <p className="empty-message">Henüz işlem bulunmuyor.</p>
              ) : (
                [...transactions]
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .slice(0, 5)
                  .map((item) => (
                    <div className="transaction" key={item.id}>
                      <div className="transaction-info">
                        <strong>{item.title}</strong>
                        <p>{item.category} · {formatDate(item.date)}</p>
                      </div>

                      <div className="transaction-actions">
                        <span className={item.type}>
                          {item.type === 'income' ? '+' : '-'} {formatMoney(item.amount)}
                        </span>

                        <button className="edit-button" onClick={() => handleEditTransaction(item)}>
                          Düzenle
                        </button>

                        <button className="delete-button" onClick={() => handleDeleteTransaction(item.id)}>
                          Sil
                        </button>
                      </div>
                    </div>
                  ))
              )}

              <button
                className="text-button"
                onClick={() => setActivePage('transactions')}
              >
                Bütün işlemleri gör →
              </button>
            </section>
          </>
        )}

        {/* GELİR VE GİDERLER */}
        {activePage === 'transactions' && (
          <section className="transactions page-section">

            <div className="section-heading">
              <div>
                <h2>İşlem Yönetimi</h2>
                <p>Gelir ve giderlerinizi buradan yönetin.</p>
              </div>

              <button
                className="primary-button"
                onClick={() => {
                  if (showForm) {
                    resetTransactionForm()
                  } else {
                    resetTransactionForm()
                    setShowForm(true)
                  }
                }}
              >
                {showForm ? 'Vazgeç' : '+ Yeni İşlem'}
              </button>
            </div>

            {showForm && (
              <form className="transaction-form" onSubmit={handleSaveTransaction}>
                <h3>{editingId !== null ? 'İşlemi Düzenle' : 'Yeni İşlem Ekle'}</h3>

                <div className="form-grid">
                  <div className="form-field">
                    <label>İşlem Türü</label>
                    <select value={type} onChange={(event) => setType(event.target.value)}>
                      <option value="expense">Gider</option>
                      <option value="income">Gelir</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Açıklama</label>
                    <input
                      type="text"
                      placeholder="Örn: Market alışverişi"
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                    />
                  </div>

                  <div className="form-field">
                    <label>Kategori</label>
                    <select value={category} onChange={(event) => setCategory(event.target.value)}>
                      {CATEGORIES.filter((item) =>
                        type === 'expense' ? item !== 'Maaş' : item === 'Maaş' || item === 'Diğer'
                      ).concat(
                        type === 'income' ? ['Ek Gelir'] : []
                      ).map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Tutar (TL)</label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="Örn: 1500"
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                    />
                  </div>

                  <div className="form-field">
                    <label>Tarih</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(event) => setDate(event.target.value)}
                    />
                  </div>
                </div>

                <div className="form-buttons">
                  <button className="primary-button" type="submit">
                    {editingId !== null ? 'Değişiklikleri Kaydet' : 'İşlemi Kaydet'}
                  </button>

                  <button className="cancel-button" type="button" onClick={resetTransactionForm}>
                    Vazgeç
                  </button>
                </div>
              </form>
            )}

            <div className="filter-area">
              <input
                type="text"
                placeholder="İşlem veya kategori ara..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

              <select value={filterType} onChange={(event) => setFilterType(event.target.value)}>
                <option value="all">Bütün işlemler</option>
                <option value="income">Gelirler</option>
                <option value="expense">Giderler</option>
              </select>

              <select value={filterMonth} onChange={(event) => setFilterMonth(event.target.value)}>
                <option value="all">Bütün aylar</option>
                {[...new Set(transactions.map((item) => item.date.slice(0, 7)))].sort().reverse().map((month) => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>

            <div className="transaction-list">
              {filteredTransactions.length === 0 ? (
                <p className="empty-message">Aramanızla eşleşen işlem bulunamadı.</p>
              ) : (
                filteredTransactions.map((item) => (
                  <div className="transaction" key={item.id}>
                    <div className="transaction-info">
                      <strong>{item.title}</strong>
                      <p>{item.category} · {formatDate(item.date)}</p>
                    </div>

                    <div className="transaction-actions">
                      <span className={item.type}>
                        {item.type === 'income' ? '+' : '-'} {formatMoney(item.amount)}
                      </span>

                      <button className="edit-button" onClick={() => handleEditTransaction(item)}>
                        Düzenle
                      </button>

                      <button className="delete-button" onClick={() => handleDeleteTransaction(item.id)}>
                        Sil
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

          </section>
        )}

        {/* AYLIK BÜTÇE PLANI */}
        {activePage === 'budget' && (
          <section className="page-section">

            <div className="section-heading">
              <div>
                <h2>Aylık Bütçe Planı</h2>
                <p>Kategorilere göre harcama limitlerinizi belirleyin.</p>
              </div>

              <input
                className="month-input"
                type="month"
                value={budgetMonth}
                onChange={(event) => setBudgetMonth(event.target.value)}
              />
            </div>

            <div className="budget-summary">
              <div>
                <span>Planlanan toplam limit</span>
                <strong>{formatMoney(Object.values(budgets).reduce((sum, value) => sum + (Number(value) || 0), 0))}</strong>
              </div>

              <div>
                <span>Gerçekleşen gider</span>
                <strong className="expense">{formatMoney(monthlyExpense)}</strong>
              </div>

              <div>
                <span>Kalan bütçe</span>
                <strong className={Object.values(budgets).reduce((sum, value) => sum + (Number(value) || 0), 0) - monthlyExpense < 0 ? 'expense' : 'income'}>
                  {formatMoney(Object.values(budgets).reduce((sum, value) => sum + (Number(value) || 0), 0) - monthlyExpense)}
                </strong>
              </div>
            </div>

            <div className="budget-list">
              {EXPENSE_CATEGORIES.map((categoryName) => {
                const spent = getCategoryExpense(categoryName)
                const limit = Number(budgets[categoryName]) || 0
                const percentage = limit > 0 ? (spent / limit) * 100 : spent > 0 ? 100 : 0
                const exceeded = spent > limit

                return (
                  <div className="budget-card" key={categoryName}>
                    <div className="budget-card-top">
                      <div>
                        <strong>{categoryName}</strong>
                        <p>Harcanan: {formatMoney(spent)}</p>
                      </div>

                      <span className={exceeded ? 'expense' : 'budget-remaining'}>
                        {limit - spent >= 0
                          ? `${formatMoney(limit - spent)} kaldı`
                          : `${formatMoney(spent - limit)} aşıldı`}
                      </span>
                    </div>

                    <div className="progress-track">
                      <div
                        className={exceeded ? 'progress-fill exceeded' : 'progress-fill'}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>

                    <div className="budget-card-bottom">
                      <label>
                        Aylık limit (TL)
                        <input
                          type="number"
                          min="0"
                          value={budgets[categoryName] ?? ''}
                          onChange={(event) => handleBudgetChange(categoryName, event.target.value)}
                        />
                      </label>

                      <span>%{Math.round(percentage)} kullanıldı</span>
                    </div>

                    {exceeded && (
                      <p className="warning-text">⚠️ Bu kategoride belirlediğiniz bütçe limitini aştınız.</p>
                    )}
                  </div>
                )
              })}
            </div>

          </section>
        )}

        {/* TASARRUF HEDEFLERİ */}
        {activePage === 'goals' && (
          <section className="page-section">

            <div className="section-heading">
              <div>
                <h2>Tasarruf Hedeflerim</h2>
                <p>Hayalleriniz için birikim yapmaya başlayın.</p>
              </div>
            </div>

            <form className="goal-form" onSubmit={handleAddGoal}>
              <h3>Yeni Tasarruf Hedefi</h3>

              <div className="form-grid">
                <div className="form-field">
                  <label>Hedefin Adı</label>
                  <input
                    type="text"
                    placeholder="Örn: Tatil, Araba, Acil Durum Fonu"
                    value={goalTitle}
                    onChange={(event) => setGoalTitle(event.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label>Hedef Tutarı (TL)</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="Örn: 50000"
                    value={goalTarget}
                    onChange={(event) => setGoalTarget(event.target.value)}
                  />
                </div>
              </div>

              <button className="primary-button" type="submit">
                + Hedef Oluştur
              </button>
            </form>

            {goals.length === 0 ? (
              <div className="empty-goals">
                <span>🐷</span>
                <h3>Henüz tasarruf hedefiniz yok.</h3>
                <p>İlk hedefinizi oluşturarak birikim yapmaya başlayabilirsiniz.</p>
              </div>
            ) : (
              <div className="goal-grid">
                {goals.map((goal) => {
                  const percentage = goal.target > 0
                    ? Math.min((goal.current / goal.target) * 100, 100)
                    : 0

                  return (
                    <div className="goal-card" key={goal.id}>
                      <div className="goal-card-heading">
                        <span className="goal-icon">🐷</span>
                        <button className="delete-button" onClick={() => handleDeleteGoal(goal.id)}>
                          Sil
                        </button>
                      </div>

                      <h3>{goal.title}</h3>

                      <p className="goal-amount">
                        {formatMoney(goal.current)}
                        <span> / {formatMoney(goal.target)}</span>
                      </p>

                      <div className="progress-track">
                        <div
                          className="goal-progress-fill"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>

                      <div className="goal-progress-info">
                        <span>%{Math.round(percentage)} tamamlandı</span>
                        {percentage >= 100 && <strong>Hedef tamamlandı! 🎉</strong>}
                      </div>

                      <button
                        className="primary-button full-button"
                        onClick={() => handleAddSaving(goal)}
                      >
                        + Birikim Ekle
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

          </section>
        )}

        <footer className="footer">
          AileBütçe · Ailenizin bütçesi, tek bir yerde. 💜
        </footer>

      </main>
    </div>
  )
}

export default App
