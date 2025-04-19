"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Plus, Trash2, Edit, Save, X, DollarSign, CreditCard, PieChartIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Types
type TransactionType = "income" | "expense"

interface Transaction {
  id: string
  description: string
  amount: number
  type: TransactionType
  category: string
  date: string
}

// Category options
const expenseCategories = [
  "Food",
  "Housing",
  "Transportation",
  "Entertainment",
  "Utilities",
  "Healthcare",
  "Shopping",
  "Other",
]

const incomeCategories = ["Salary", "Freelance", "Investments", "Gifts", "Other"]

// Colors for pie chart
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FF6B6B", "#6B66FF"]

export default function FinanceTracker() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [type, setType] = useState<TransactionType>("expense")
  const [category, setCategory] = useState(expenseCategories[0])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("dashboard")

  // Load data from localStorage on initial render
  useEffect(() => {
    const savedTransactions = localStorage.getItem("transactions")
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions))
    }
  }, [])

  // Save to localStorage whenever transactions change
  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions))
  }, [transactions])

  // Calculate totals
  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpenses

  // Prepare data for pie chart
  const expensesByCategory = transactions
    .filter((t) => t.type === "expense")
    .reduce(
      (acc, transaction) => {
        const existingCategory = acc.find((item) => item.name === transaction.category)
        if (existingCategory) {
          existingCategory.value += transaction.amount
        } else {
          acc.push({ name: transaction.category, value: transaction.amount })
        }
        return acc
      },
      [] as { name: string; value: number }[],
    )

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!description || !amount || Number.parseFloat(amount) <= 0) {
      return
    }

    const newTransaction: Transaction = {
      id: editingId || Date.now().toString(),
      description,
      amount: Number.parseFloat(amount),
      type,
      category,
      date: new Date().toISOString().split("T")[0],
    }

    if (editingId) {
      setTransactions(transactions.map((t) => (t.id === editingId ? newTransaction : t)))
      setEditingId(null)
    } else {
      setTransactions([...transactions, newTransaction])
    }

    // Reset form
    setDescription("")
    setAmount("")
    setType("expense")
    setCategory(expenseCategories[0])
  }

  // Start editing a transaction
  const handleEdit = (transaction: Transaction) => {
    setEditingId(transaction.id)
    setDescription(transaction.description)
    setAmount(transaction.amount.toString())
    setType(transaction.type)
    setCategory(transaction.category)
    setActiveTab("add")
  }

  // Delete a transaction
  const handleDelete = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id))
  }

  // Cancel editing
  const handleCancel = () => {
    setEditingId(null)
    setDescription("")
    setAmount("")
    setType("expense")
    setCategory(expenseCategories[0])
  }

  // Update category options based on transaction type
  useEffect(() => {
    setCategory(type === "expense" ? expenseCategories[0] : incomeCategories[0])
  }, [type])

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-8">Personal Finance Tracker</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="add">Add Transaction</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <DollarSign className="h-4 w-4 mr-1 text-green-500" />
                  Income
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-500">${totalIncome.toFixed(2)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <CreditCard className="h-4 w-4 mr-1 text-red-500" />
                  Expenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-500">${totalExpenses.toFixed(2)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <PieChartIcon className="h-4 w-4 mr-1 text-blue-500" />
                  Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={cn("text-2xl font-bold", balance >= 0 ? "text-green-500" : "text-red-500")}>
                  ${balance.toFixed(2)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Pie Chart */}
          {expensesByCategory.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
                <CardDescription>Distribution of your expenses by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expensesByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {expensesByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No expense data to display. Add some transactions to see your spending breakdown.
              </CardContent>
            </Card>
          )}

          {/* Transactions List */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest financial activities</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{transaction.description}</span>
                            <Badge variant={transaction.type === "income" ? "outline" : "destructive"}>
                              {transaction.category}
                            </Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">{transaction.date}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span
                            className={cn(
                              "font-semibold",
                              transaction.type === "income" ? "text-green-500" : "text-red-500",
                            )}
                          >
                            {transaction.type === "income" ? "+" : "-"}${transaction.amount.toFixed(2)}
                          </span>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(transaction)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(transaction.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No transactions yet. Add your first transaction to get started.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? "Edit Transaction" : "Add New Transaction"}</CardTitle>
              <CardDescription>
                {editingId ? "Update your transaction details" : "Record a new income or expense"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Transaction Type</Label>
                  <RadioGroup
                    value={type}
                    onValueChange={(value) => setType(value as TransactionType)}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="expense" id="expense" />
                      <Label htmlFor="expense">Expense</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="income" id="income" />
                      <Label htmlFor="income">Income</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What was this transaction for?"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {(type === "expense" ? expenseCategories : incomeCategories).map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingId ? (
                      <>
                        <Save className="mr-2 h-4 w-4" /> Update
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" /> Add
                      </>
                    )}
                  </Button>

                  {editingId && (
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      <X className="mr-2 h-4 w-4" /> Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
