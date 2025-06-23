import { sql } from "../config/db.js";

export async function getTransactionsByUserId(req, res) {
  try {
    const { userId } = req.params;
    console.log("Retrieving transactions for user:", userId);
    const transactions =
      await sql`SELECT * FROM transactions WHERE user_id = ${userId} ORDER BY created_at DESC`;

    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error retrieving transactions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function createTransaction(req, res) {
  try {
    const { userId, title, amount, category } = req.body;
    if (!userId || !title || !amount || !category) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const transaction = await sql`
      INSERT INTO transactions (user_id, title, amount, category)
      VALUES (${userId}, ${title}, ${amount}, ${category})
      RETURNING *
    `;
    console.log("Transaction created:", transaction[0]);
    res.status(201).json(transaction[0]);
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function deleteTransaction(req, res) {
  try {
    const { id } = req.params;
    if (isNaN(parseInt(id, 10)) || parseInt(id, 10) <= 0) {
      return res.status(400).json({ error: "Transaction ID is required" });
    }
    const result =
      await sql`DELETE FROM transactions WHERE id = ${id} RETURNING *`;
    if (result.length === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    console.log("Transaction deleted:", result[0]);
    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getSummaryByUserId(req, res) {
  try {
    const { userId } = req.params;

    const balanceResult = await sql`
      SELECT COALESCE(SUM(amount), 0) AS balance FROM transactions 
      WHERE user_id = ${userId}
    `;

    const incomeResult = await sql`
      SELECT COALESCE(SUM(amount), 0) AS income FROM transactions 
      WHERE user_id = ${userId} AND amount > 0
    `;

    const expensesResult = await sql`
      SELECT COALESCE(SUM(amount), 0) AS expenses FROM transactions 
      WHERE user_id = ${userId} AND amount < 0
    `;

    return res.status(200).json({
      balance: balanceResult[0].balance,
      income: incomeResult[0].income,
      expense: expensesResult[0].expenses,
    });
  } catch (error) {
    console.error("Error getting summary:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
