import React, { useEffect, useState } from 'react';
import LoginForm from './LoginForm'; // LoginFormをインポート

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // ログイン状態を管理するステート
  const [devotions, setDevotions] = useState([]);
  const [scripture, setScripture] = useState('');
  const [content, setContent] = useState('');

  // 編集機能追加
  const [editingId, setEditingId] = useState(null);
  const [editScripture, setEditScripture] = useState('');
  const [editContent, setEditContent] = useState('');

  // 聖書箇所取得機能追加
  const [verseQuery, setVerseQuery] = useState('');
  const [verseResult, setVerseResult] = useState('');
  const [loadingVerse, setLoadingVerse] = useState(false);

  // 検索機能追加
  const [searchTerm, setSearchTerm] = useState('');

  // 今日の日付を初期値にする機能追加
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // yyyy-mm-dd形式に整える
  });

  // 編集時に日付も変更できる機能追加
  const [editDate, setEditDate] = useState('');

  // 並べ替え用の状態変数を追加
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' = 新→旧, 'asc' = 旧→新

  // 「お気に入りだけ表示する」フィルター機能追加
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // ログイン状態を確認するuseEffect
  useEffect(() => {
    const token = localStorage.getItem('token');
    const isTokenValid = !!token;
    setIsLoggedIn(isTokenValid);
    console.log('isLoggedIn:', isTokenValid); // トークンの有無を確認
  }, []);


  // データ取得（GET）
  useEffect(() => {
    if (isLoggedIn) {
      const token = localStorage.getItem('token');
      fetch('http://localhost:8000/api/devotions/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`  // ★ ここが大事！
        }
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('取得に失敗しました');
          }
          return response.json();
        })
        .then(data => {
          console.log('Fetched devotions:', data); // 取得したデータを確認
          const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
          setDevotions(sorted);
        })
        .catch(error => console.error('エラー:', error));
    } else {
      setDevotions([]);
    }
  }, [isLoggedIn]); // isLoggedInが変わるたびにデータを再取得

  // データ送信（POST）
  const handleSubmit = (e) => {
    e.preventDefault();

    const today = new Date().toISOString().split("T")[0];
    if (date > today) {
      alert("Please choose a date that is today or earlier.");
      return;
    }

    const newDevotion = {
      scripture: scripture,
      content: content,
      date: date
    };

    console.log('送信時のトークン:', localStorage.getItem('token'));

    fetch('http://localhost:8000/api/devotions/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`  // ← ここ追加！
      },
      body: JSON.stringify(newDevotion)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('送信に失敗しました');
        }
        return response.json(); // 成功時だけ JSON 変換
      })
      .then(data => {
        setDevotions([data, ...devotions]);
        setScripture('');
        setContent('');
      })
      .catch(error => {
        console.error('送信エラー:', error);
        alert('投稿に失敗しました');
      });
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditScripture(item.scripture);
    setEditContent(item.content);
    setEditDate(item.date); // 🔽 追加
  };

  // 編集時、未来日を選択した場合、メッセージが出るように改修（スマホ版用）
  const handleUpdate = (id) => {
    const today = new Date().toISOString().split("T")[0];
    if (editDate > today) {
      alert("Please choose a date that is today or earlier.");
      return;
    }

    const updatedDevotion = {
      scripture: editScripture,
      content: editContent,
      date: editDate, // 🔽 追加
    };

    fetch(`http://localhost:8000/api/devotions/${id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` // ← これ追加！
      },
      body: JSON.stringify(updatedDevotion),
    })
      .then((response) => response.json())
      .then((data) => {
        const updatedList = devotions.map((item) =>
          item.id === id ? data : item
        );
        // 日付の新しい順に並び替えてからセット
        const sortedList = updatedList.sort((a, b) => new Date(b.date) - new Date(a.date));
        setDevotions(sortedList);
        setEditingId(null);
      })
      .catch((error) => {
        console.error('更新エラー:', error);
      });
  };

  // Devotion削除用関数
  const handleDelete = (id) => {
    // ここで確認ダイアログを出す
    const confirmDelete = window.confirm("Are you sure you want to delete this devotion?");

    // キャンセルされたら何もせず終了
    if (!confirmDelete) return;

    // OKなら削除処理を続ける
    fetch(`http://localhost:8000/api/devotions/${id}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}` // ← 追加！
      },
    })
      .then(() => {
        const updatedList = devotions.filter(item => item.id !== id);
        setDevotions(updatedList);
      })
      .catch(error => {
        console.error('削除エラー:', error);
      });
  };

  // フィルタリング（検索）機能を実現するための処理 → 「検索 + お気に入りフィルター」に対応させる処理へ変更
  const filteredDevotions = devotions.filter((item) => {
    const matchesSearch =
      item.scripture?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFavorite = showOnlyFavorites ? item.favorite : true;

    return matchesSearch && matchesFavorite;
  });

  // 表示用の配列 filteredDevotions を並べ替えるように変更
  const sortedDevotions = [...filteredDevotions].sort((a, b) => {
    if (sortOrder === 'desc') {
      return new Date(b.date) - new Date(a.date);
    } else {
      return new Date(a.date) - new Date(b.date);
    }
  });

  // お気に入り状態（favorite）を切り替えるための関数追加
  const toggleFavorite = (id, currentFavorite) => {
    // 該当のアイテムを取得
    const item = devotions.find(d => d.id === id);
    if (!item) return;

    // 全フィールドを送る
    fetch(`http://localhost:8000/api/devotions/${id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` // ← 追加！
      },
      body: JSON.stringify({
        scripture: item.scripture,
        content: item.content,
        date: item.date,
        favorite: !currentFavorite,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        const updatedList = devotions.map((d) => (d.id === id ? data : d));
        setDevotions(updatedList);
      })
      .catch((error) => console.error('お気に入り更新エラー:', error));
  };

  return (
    <div className="App" style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h1>Devotion Records</h1>
      {/* ログイン状態によって表示を切り替え */}
      {isLoggedIn ? (
        <>
          {/* --- Bible verse lookup --- */}
          <div style={{ marginBottom: 20 }}>
            <input
              type="text"
              placeholder="Enter verse (e.g. John 3:16)"
              value={verseQuery}
              onChange={(e) => setVerseQuery(e.target.value)}
              style={{ marginRight: 10, width: '150px' }}
            />
            <button
              onClick={() => {
                setLoadingVerse(true);
                fetch(`https://bible-api.com/${encodeURIComponent(verseQuery)}`)
                  .then(res => res.json())
                  .then(data => {
                    if (data.text) {
                      setVerseResult(data.text.trim());
                    } else {
                      setVerseResult('Verse not found.');
                    }
                  })
                  .catch(() => setVerseResult('Error fetching verse.'))
                  .finally(() => setLoadingVerse(false));
              }}
            >
              {loadingVerse ? 'Loading...' : 'Search Verse'}
            </button>
            {verseResult && (
              <div
                style={{
                  marginTop: 10,
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '5px',
                  backgroundColor: '#f9f9f9',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {verseResult}
              </div>
            )}
          </div>

          <div>
            <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
              <div>
                <label>Scripture:</label>
                <input
                  type="text"
                  value={scripture}
                  onChange={(e) => setScripture(e.target.value)}
                  required
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label>Content:</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={4}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label>Date:</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    e.target.blur(); // ← 選択後にカレンダーを閉じる
                  }}
                  required
                />
              </div>
              <button type="submit" style={{ marginTop: '10px' }}>Add Devotion</button>
            </form>

            {/* --- Controls for sorting and filtering --- */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              <button onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}>
                Sort: {sortOrder === 'desc' ? 'Newest → Oldest' : 'Oldest → Newest'}
              </button>

              <button
                onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                style={{ background: showOnlyFavorites ? '#ffe08a' : 'white' }}
              >
                {showOnlyFavorites ? 'Show All' : 'Show Only Favorites'}
              </button>
            </div>

            {/* デボーションのデータがあれば表示 */}
            {devotions.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, marginTop: 10 }}>
                {sortedDevotions.map((item) => (
                  <li key={item.id} style={{ marginBottom: 16 }}>
                    <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
                      {editingId === item.id ? (
                        // ---------- Editing mode ----------
                        <div>
                          <div style={{ marginBottom: 8 }}>
                            <label style={{ display: 'block', fontSize: 12, color: '#555' }}>Scripture</label>
                            <input
                              type="text"
                              value={editScripture}
                              onChange={(e) => setEditScripture(e.target.value)}
                              style={{ width: '100%' }}
                            />
                          </div>
                          <div style={{ marginBottom: 8 }}>
                            <label style={{ display: 'block', fontSize: 12, color: '#555' }}>Content</label>
                            <textarea
                              rows={4}
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              style={{ width: '100%' }}
                            />
                          </div>
                          <div style={{ marginBottom: 8 }}>
                            <label style={{ display: 'block', fontSize: 12, color: '#555' }}>Date</label>
                            <input
                              type="date"
                              value={editDate}
                              onChange={(e) => {
                                setEditDate(e.target.value);
                                e.target.blur(); // ← 選択後にカレンダーを閉じる
                              }}
                            />
                          </div>

                          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                            <button onClick={() => handleUpdate(item.id)}>Save</button>
                            <button onClick={() => setEditingId(null)}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        // ---------- View mode ----------
                        <div>
                          <div style={{ fontWeight: 700 }}>
                            {item.date} {item.scripture ? `• ${item.scripture}` : ''}
                          </div>
                          {item.content && <p style={{ whiteSpace: 'pre-wrap', marginTop: 6 }}>{item.content}</p>}

                          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                            <button onClick={() => startEdit(item)}>Edit</button>
                            <button onClick={() => handleDelete(item.id)}>Delete</button>
                            <button onClick={() => toggleFavorite(item.id, item.favorite)}>
                              {item.favorite ? 'Unfavorite' : 'Favorite'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No devotions yet.</p>
            )}
          </div>
        </>
      ) : (
        <LoginForm onLoginSuccess={() => setIsLoggedIn(true)} />
      )}
    </div>
  );
}

export default App;
