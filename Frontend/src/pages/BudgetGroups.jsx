import { useMemo, useState } from "react";
import { Calculator, Check, ChevronRight, ImageUp, Plus, ReceiptText, UsersRound, WalletCards, X } from "lucide-react";
import AppSidebar from "../components/AppSidebar";
import UserProfile from "../components/UserProfile";
import "../styles/Dashboard.css";
import "../styles/BudgetGroups.css";

const initialGroups = [
  {
    id: "family",
    name: "Family",
    balance: 4200,
    members: ["You", "Ahmed Hassan", "Mariam Adel", "Youssef Samir"],
  },
  {
    id: "friends",
    name: "Friends",
    balance: 1850,
    members: ["You", "Nour Mohamed", "Omar Khaled", "Farah Ali"],
  },
];

const starterItems = [
  { id: 1, name: "Chicken shawerma", amount: 185, member: "You" },
  { id: 2, name: "Pasta Alfredo", amount: 210, member: "Nour Mohamed" },
  { id: 3, name: "Margherita pizza", amount: 170, member: "Omar Khaled" },
  { id: 4, name: "Fresh juice", amount: 65, member: "Farah Ali" },
];

const suggestedFriends = ["Laila Mostafa", "Karim Atef", "Salma Tarek", "Ziad Mahmoud"];
const money = (amount) => `EGP ${Number(amount || 0).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
const initials = (name) => name.split(" ").map((word) => word[0]).slice(0, 2).join("");

function BudgetGroups() {
  const [groups, setGroups] = useState(initialGroups);
  const [activeGroupId, setActiveGroupId] = useState("friends");
  const [items, setItems] = useState(starterItems);
  const [receiptUrl, setReceiptUrl] = useState("");
  const [newItem, setNewItem] = useState({ name: "", amount: "" });
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [friendIndex, setFriendIndex] = useState(0);

  const group = groups.find((entry) => entry.id === activeGroupId) || groups[0];
  const amountsByMember = useMemo(() => group.members.reduce((totals, member) => ({
    ...totals,
    [member]: items.filter((item) => item.member === member).reduce((sum, item) => sum + Number(item.amount || 0), 0),
  }), {}), [group.members, items]);
  const receiptTotal = useMemo(() => items.reduce((sum, item) => sum + Number(item.amount || 0), 0), [items]);
  const assignedTotal = useMemo(() => Object.values(amountsByMember).reduce((sum, amount) => sum + amount, 0), [amountsByMember]);

  function addMember() {
    const friend = suggestedFriends[friendIndex % suggestedFriends.length];
    if (group.members.includes(friend)) return;
    setGroups((current) => current.map((entry) => entry.id === group.id ? { ...entry, members: [...entry.members, friend] } : entry));
    setFriendIndex((current) => current + 1);
  }

  function createGroup(event) {
    event.preventDefault();
    const name = groupName.trim();
    if (!name) return;
    const id = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
    setGroups((current) => [...current, { id, name, balance: 0, members: ["You"] }]);
    setActiveGroupId(id);
    setGroupName("");
    setCreatingGroup(false);
    setItems([]);
  }

  function uploadReceipt(event) {
    const file = event.target.files?.[0];
    if (file) setReceiptUrl(URL.createObjectURL(file));
  }

  function addItem(event) {
    event.preventDefault();
    const amount = Number(newItem.amount);
    if (!newItem.name.trim() || !Number.isFinite(amount) || amount <= 0) return;
    setItems((current) => [...current, { id: Date.now(), name: newItem.name.trim(), amount, member: "" }]);
    setNewItem({ name: "", amount: "" });
  }

  function changeItem(id, changes) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, ...changes } : item));
  }

  return (
    <div className="budget-groups-page">
      <AppSidebar active="groups" />
      <main className="budget-groups-main">
        <header className="budget-groups-header">
          <div>
            <span className="groups-kicker">MONEY WORKS BETTER TOGETHER</span>
            <h1>Budget groups</h1>
            <p>Create shared pots, invite your people, and settle a receipt without the awkward math.</p>
          </div>
          <UserProfile />
        </header>

        <section className="group-overview" aria-label="Your budget groups">
          <div className="group-overview-heading"><div><span>YOUR GROUPS</span><h2>Share money with your circle</h2></div><button type="button" onClick={() => setCreatingGroup(true)}><Plus size={16} /> New group</button></div>
          <div className="group-cards">
            {groups.map((entry) => <button type="button" className={`group-card ${entry.id === group.id ? "selected" : ""}`} key={entry.id} onClick={() => { setActiveGroupId(entry.id); setItems(entry.id === "friends" ? starterItems : []); }}>
              <span className="group-card-icon"><UsersRound size={20} /></span><span className="group-card-copy"><strong>{entry.name}</strong><small>{entry.members.length} members</small></span><b>{money(entry.balance)}</b><ChevronRight size={17} />
            </button>)}
          </div>
          {creatingGroup && <form className="new-group-form" onSubmit={createGroup}><input autoFocus value={groupName} onChange={(event) => setGroupName(event.target.value)} placeholder="e.g. Weekend trip" /><button type="submit">Create group</button><button type="button" className="quiet-button" onClick={() => setCreatingGroup(false)}><X size={16} /></button></form>}
        </section>

        <section className="group-workspace">
          <aside className="members-panel">
            <div className="workspace-title"><span>{group.name.toUpperCase()} GROUP</span><h2>People</h2></div>
            <div className="shared-pot"><WalletCards size={19} /><div><span>Shared balance</span><strong>{money(group.balance)}</strong></div></div>
            <div className="member-list">{group.members.map((member, index) => <div className="member-row" key={member}><i className={`member-avatar avatar-${index % 4}`}>{initials(member)}</i><div><strong>{member}</strong><span>{member === "You" ? "Group owner" : "Member"}</span></div>{items.some((item) => item.member === member) && <Check size={16} />}</div>)}</div>
            <button className="add-member-button" type="button" onClick={addMember}><Plus size={16} /> Add {suggestedFriends[friendIndex % suggestedFriends.length]}</button>
          </aside>

          <section className="receipt-panel">
            <div className="receipt-heading"><div><span>RECEIPT SPLITTER</span><h2>Who ordered what?</h2><p>Upload the receipt, then assign each item to the person who had it.</p></div><div className="receipt-total"><span>Receipt total</span><strong>{money(receiptTotal)}</strong></div></div>
            <div className="receipt-upload-row">
              <label className="receipt-upload">{receiptUrl ? <img src={receiptUrl} alt="Uploaded receipt" /> : <><ImageUp size={23} /><strong>Upload receipt photo</strong><small>JPG, PNG, or HEIC</small></>}<input type="file" accept="image/*" onChange={uploadReceipt} /></label>
              <div className="receipt-upload-copy"><ReceiptText size={20} /><div><strong>{receiptUrl ? "Receipt attached" : "Add your receipt"}</strong><p>{receiptUrl ? "Now check the items and choose who ordered each one." : "Use the item list below to enter or correct what is on the receipt."}</p></div></div>
            </div>

            <div className="split-list" role="table" aria-label="Receipt items">
              <div className="split-list-head" role="row"><span>Item</span><span>Price</span><span>Ordered by</span><span /></div>
              {items.map((item) => <div className="split-item" role="row" key={item.id}><input aria-label="Item name" value={item.name} onChange={(event) => changeItem(item.id, { name: event.target.value })} /><input aria-label="Item price" type="number" min="0" step="0.01" value={item.amount} onChange={(event) => changeItem(item.id, { amount: event.target.value })} /><select aria-label={`Assign ${item.name}`} value={item.member} onChange={(event) => changeItem(item.id, { member: event.target.value })}><option value="">Choose a person</option>{group.members.map((member) => <option value={member} key={member}>{member}</option>)}</select><button type="button" aria-label={`Remove ${item.name}`} onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))}><X size={16} /></button></div>)}
            </div>
            <form className="add-receipt-item" onSubmit={addItem}><input value={newItem.name} onChange={(event) => setNewItem((current) => ({ ...current, name: event.target.value }))} placeholder="Add receipt item" /><input value={newItem.amount} onChange={(event) => setNewItem((current) => ({ ...current, amount: event.target.value }))} placeholder="EGP" type="number" min="0" step="0.01" /><button type="submit"><Plus size={16} /> Add item</button></form>
          </section>
        </section>

        <section className="settlement-card"><div><span><Calculator size={15} /> SPLIT CALCULATED</span><h2>Everyone&apos;s share</h2><p>{assignedTotal === receiptTotal ? "All receipt items are assigned." : `${money(receiptTotal - assignedTotal)} still needs to be assigned.`}</p></div><div className="settlement-amounts">{group.members.map((member) => <div key={member}><i>{initials(member)}</i><span>{member}</span><strong>{money(amountsByMember[member])}</strong></div>)}</div></section>
      </main>
    </div>
  );
}

export default BudgetGroups;
