# 🪨 Rock-Paper-Scissors App ✂️

### API-based application for the world-famous game

## 🚀 Getting Started

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start the server:**

   ```bash
   npm run start
   ```

3. **Simulate users:**  
   Open **two additional terminals** to simulate two separate users.

4. **Connect clients:**  
   In each terminal, run:
   ```bash
   node client/custom_cli YOURNAME
   ```
   This will connect the client and register a player with the provided nickname.
   > If no name is provided, the player will appear as `Anonymous`.

You should see an output like:

```
Match created vs John
```

✅ **Congratulations! You've successfully established a socket connection between two players.**

---

## 🎮 How to Play

Once connected, you can:

### 📊 Check your score

Just type:

```
score
```

> ℹ️ **Note:** Score resets when any player disconnects.

---

### ✋ Make a move

You can choose one of the following elements:

- **Rock**
- **Paper**
- **Scissors**

> ✨ Inputs are **not case-sensitive** — type them however you like!

You can **change your move** at any time until both players have submitted their choices.

Once both moves are set, the result will be displayed in this format:

```
Result: { you: 'rock', opponent: 'paper', score: 0, outcome: 'lose' }
```

---

### 🔁 Rematch

To play again, both players should type:

```
rematch
```

If your opponent agrees — the game will restart.

---

### 🎉 Enjoy the game!
