import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  db, 
  isFirebaseConfigured, 
  demoStore 
} from '../services/firebase.js';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';

const MenuContext = createContext(null);

export function MenuProvider({ children }) {
  const [menu, setMenu] = useState([]);
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Synchronize Menu
  useEffect(() => {
    if (isFirebaseConfigured && db) {
      const menuUnsub = onSnapshot(collection(db, 'menu'), (snap) => {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (items.length > 0) {
          setMenu(items);
        } else {
          // Initialize if empty in firestore
          const initial = demoStore.getMenu();
          setMenu(initial);
          initial.forEach(it => setDoc(doc(db, 'menu', it.id), it));
        }
        setLoading(false);
      }, (err) => {
        console.error('Firestore menu subscription error:', err);
        setMenu(demoStore.getMenu());
        setLoading(false);
      });

      const comboUnsub = onSnapshot(collection(db, 'combos'), (snap) => {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (items.length > 0) {
          setCombos(items);
        } else {
          const initialCombos = demoStore.getCombos();
          setCombos(initialCombos);
          initialCombos.forEach(c => setDoc(doc(db, 'combos', c.id), c));
        }
      }, (err) => {
        console.error('Firestore combo subscription error:', err);
        setCombos(demoStore.getCombos());
      });

      return () => {
        menuUnsub();
        comboUnsub();
      };
    } else {
      // Demo Store subscription
      setMenu(demoStore.getMenu());
      setCombos(demoStore.getCombos());
      setLoading(false);

      const unsubMenu = demoStore.subscribe('menu', (newMenu) => setMenu(newMenu));
      const unsubCombos = demoStore.subscribe('combos', (newCombos) => setCombos(newCombos));

      return () => {
        unsubMenu();
        unsubCombos();
      };
    }
  }, []);

  // Menu operations
  const addMenuItem = async (newItem) => {
    const itemWithDefaults = {
      ...newItem,
      id: newItem.id || `m_${Date.now()}`,
      isAvailable: newItem.isAvailable !== undefined ? newItem.isAvailable : true,
      price: Number(newItem.price),
      prepTimeMinutes: Number(newItem.prepTimeMinutes) || 5,
      rating: 4.8
    };

    if (isFirebaseConfigured && db) {
      await setDoc(doc(db, 'menu', itemWithDefaults.id), itemWithDefaults);
    } else {
      const current = demoStore.getMenu();
      const updated = [itemWithDefaults, ...current];
      demoStore.setMenu(updated);
      setMenu(updated);
    }
    return itemWithDefaults;
  };

  const updateMenuItem = async (itemId, fields) => {
    if (isFirebaseConfigured && db) {
      await updateDoc(doc(db, 'menu', itemId), fields);
    } else {
      const current = demoStore.getMenu();
      const updated = current.map(it => it.id === itemId ? { ...it, ...fields } : it);
      demoStore.setMenu(updated);
      setMenu(updated);
    }
  };

  const toggleAvailability = async (itemId, isAvailable) => {
    await updateMenuItem(itemId, { isAvailable });
  };

  const deleteMenuItem = async (itemId) => {
    if (isFirebaseConfigured && db) {
      await deleteDoc(doc(db, 'menu', itemId));
    } else {
      const current = demoStore.getMenu();
      const updated = current.filter(it => it.id !== itemId);
      demoStore.setMenu(updated);
      setMenu(updated);
    }
  };

  // Combo operations
  const addCombo = async (newCombo) => {
    const comboWithId = {
      ...newCombo,
      id: newCombo.id || `c_${Date.now()}`,
      isAvailable: true
    };

    if (isFirebaseConfigured && db) {
      await setDoc(doc(db, 'combos', comboWithId.id), comboWithId);
    } else {
      const current = demoStore.getCombos();
      const updated = [comboWithId, ...current];
      demoStore.setCombos(updated);
      setCombos(updated);
    }
    return comboWithId;
  };

  const toggleComboAvailability = async (comboId, isAvailable) => {
    if (isFirebaseConfigured && db) {
      await updateDoc(doc(db, 'combos', comboId), { isAvailable });
    } else {
      const current = demoStore.getCombos();
      const updated = current.map(c => c.id === comboId ? { ...c, isAvailable } : c);
      demoStore.setCombos(updated);
      setCombos(updated);
    }
  };

  const deleteCombo = async (comboId) => {
    if (isFirebaseConfigured && db) {
      await deleteDoc(doc(db, 'combos', comboId));
    } else {
      const current = demoStore.getCombos();
      const updated = current.filter(c => c.id !== comboId);
      demoStore.setCombos(updated);
      setCombos(updated);
    }
  };

  return (
    <MenuContext.Provider value={{
      menu,
      combos,
      loading,
      addMenuItem,
      updateMenuItem,
      toggleAvailability,
      deleteMenuItem,
      addCombo,
      toggleComboAvailability,
      deleteCombo
    }}>
      {children}
    </MenuContext.Provider>
  );
}

export const useMenu = () => useContext(MenuContext);
