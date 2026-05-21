import { useEffect, useRef, useState } from "react";

export default function App() {
  const fileInputRef = useRef(null);

  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem("englishReviewNotes");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: Date.now(),
            date: "2026-05-21",
            category: "Pharmacy",
            korean: "카운터에서 먼저 결제해주세요.",
            english: "Could you please pay at the counter first?",
            memo: "Could you please ~? = 정중하게 요청할 때 사용",
            completed: false,
            wrong: false,
            showEnglish: false,
            showMemo: false,
            editing: false,
          },
        ];
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem("englishReviewCategories");
    return saved
      ? JSON.parse(saved)
      : ["General", "Pharmacy", "Daily", "Interview"];
  });

  const [activeFolder, setActiveFolder] = useState("review");
  const [activeCategory, setActiveCategory] = useState("All");
  const [showCategories, setShowCategories] = useState(false);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [openCategoryMenu, setOpenCategoryMenu] = useState(null);

  const [search, setSearch] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [speechRate, setSpeechRate] = useState(1));

  const [newKorean, setNewKorean] = useState("");
  const [newEnglish, setNewEnglish] = useState("");
  const [newMemo, setNewMemo] = useState("");
  const [newCategory, setNewCategory] = useState("General");

  useEffect(() => {
    localStorage.setItem("englishReviewNotes", JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem("englishReviewCategories", JSON.stringify(categories));
  }, [categories]);

  const addCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;

    if (categories.includes(trimmed)) {
      alert("이미 있는 카테고리입니다.");
      return;
    }

    setCategories([...categories, trimmed]);
    setNewCategory(trimmed);
    setActiveCategory(trimmed);
    setNewCategoryName("");
  };

  const startEditCategory = (categoryName) => {
    setEditingCategory(categoryName);
    setEditingCategoryName(categoryName);
    setOpenCategoryMenu(null);
  };

  const saveCategoryName = () => {
    const oldName = editingCategory;
    const newName = editingCategoryName.trim();

    if (!newName) return;

    if (categories.includes(newName) && oldName !== newName) {
      alert("이미 있는 카테고리 이름입니다.");
      return;
    }

    setCategories(
      categories.map((category) =>
        category === oldName ? newName : category
      )
    );

    setNotes(
      notes.map((note) =>
        note.category === oldName ? { ...note, category: newName } : note
      )
    );

    if (activeCategory === oldName) setActiveCategory(newName);
    if (newCategory === oldName) setNewCategory(newName);

    setEditingCategory(null);
    setEditingCategoryName("");
    setOpenCategoryMenu(null);
  };

  const deleteCategory = (categoryName) => {
    const hasNotes = notes.some((note) => note.category === categoryName);

    if (hasNotes) {
      const move = confirm(
        `"${categoryName}" 폴더에 저장된 문장이 있습니다.\n폴더를 삭제하고 안의 문장들을 General로 이동할까요?`
      );

      if (!move) return;

      setNotes(
        notes.map((note) =>
          note.category === categoryName
            ? { ...note, category: "General" }
            : note
        )
      );
    } else {
      if (!confirm(`"${categoryName}" 폴더를 삭제할까요?`)) return;
    }

    setCategories(categories.filter((category) => category !== categoryName));

    if (activeCategory === categoryName) setActiveCategory("All");
    if (newCategory === categoryName) setNewCategory("General");
    setOpenCategoryMenu(null);
  };

  const addNote = () => {
    if (!newKorean.trim() || !newEnglish.trim()) return;

    const today = new Date().toISOString().split("T")[0];

    setNotes([
      {
        id: Date.now(),
        date: today,
        category: newCategory,
        korean: newKorean,
        english: newEnglish,
        memo: newMemo,
        completed: false,
        wrong: false,
        showEnglish: false,
        showMemo: false,
        editing: false,
      },
      ...notes,
    ]);

    setNewKorean("");
    setNewEnglish("");
    setNewMemo("");
    setActiveFolder("review");
    setActiveCategory(newCategory);
  };

  const updateNote = (id, changes) => {
    setNotes(
      notes.map((note) => (note.id === id ? { ...note, ...changes } : note))
    );
  };

  const deleteNote = (id) => {
    if (confirm("정말 삭제할까요?")) {
      setNotes(notes.filter((note) => note.id !== id));
    }
  };

  const speakEnglish = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = speechRate;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  };

  const backupData = () => {
    const data = {
      notes,
      categories,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "english-review-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const restoreData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);

        if (!data.notes || !data.categories) {
          alert("올바른 백업 파일이 아닙니다.");
          return;
        }

        const ok = confirm(
          "백업 파일을 불러오면 현재 저장된 데이터가 교체됩니다. 계속할까요?"
        );

        if (!ok) return;

        setNotes(data.notes);
        setCategories(data.categories);
        setActiveCategory("All");
        setActiveFolder("review");

        alert("백업 데이터를 불러왔습니다.");
      } catch {
        alert("파일을 불러오는 중 오류가 발생했습니다.");
      }
    };

    reader.readAsText(file);
    event.target.value = "";
  };

  const filteredNotes = notes.filter((note) => {
    const matchesFolder =
      activeFolder === "review"
        ? !note.completed
        : activeFolder === "completed"
        ? note.completed
        : note.wrong;

    const matchesCategory =
      activeCategory === "All" ? true : note.category === activeCategory;

    const matchesSearch =
      note.korean.includes(search) ||
      note.english.toLowerCase().includes(search.toLowerCase()) ||
      note.memo.toLowerCase().includes(search.toLowerCase()) ||
      note.category.toLowerCase().includes(search.toLowerCase()) ||
      note.date.includes(search);

    return matchesFolder && matchesCategory && matchesSearch;
  });

  const reviewCount = notes.filter((n) => !n.completed).length;
  const completedCount = notes.filter((n) => n.completed).length;
  const wrongCount = notes.filter((n) => n.wrong).length;

  const categoryCount = (category) =>
    notes.filter((note) => note.category === category).length;

  const bg = darkMode ? "#111827" : "#ffffff";
  const text = darkMode ? "#f9fafb" : "#111827";
  const card = darkMode ? "#1f2937" : "#ffffff";

  return (
    <div
      style={{
        padding: 20,
        fontFamily: "sans-serif",
        maxWidth: 950,
        margin: "0 auto",
        backgroundColor: bg,
        color: text,
        minHeight: "100vh",
      }}
    >
      <h1 style={{ textAlign: "center" }}>📚 English Review App</h1>

      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 10,
          flexWrap: "wrap",
        }}
      >
        <button onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "☀️ 라이트모드" : "🌙 다크모드"}
        </button>

        <button onClick={backupData}>💾 데이터 백업</button>

        <button onClick={() => fileInputRef.current.click()}>
          📂 데이터 불러오기
        </button>

        <button onClick={() => setShowCategories(!showCategories)}>
          📁 카테고리 폴더
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={restoreData}
          style={{ display: "none" }}
        />
      </div>

      {showCategories && (
        <div
          style={{
            border: "1px solid #ccc",
            padding: 15,
            borderRadius: 10,
            marginBottom: 20,
            backgroundColor: card,
          }}
        >
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input
              placeholder="새 카테고리 이름"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              style={{ flex: 1, padding: 10 }}
            />
            <button onClick={addCategory}>폴더 생성</button>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <button
              onClick={() => setActiveCategory("All")}
              style={{
                padding: 10,
                backgroundColor:
                  activeCategory === "All" ? "#dbeafe" : "white",
              }}
            >
              📂 전체 ({notes.length})
            </button>

            {categories.map((category) => (
              <div
                key={category}
                style={{
                  display: "flex",
                  gap: 4,
                  alignItems: "center",
                  position: "relative",
                }}
              >
                {editingCategory === category ? (
                  <>
                    <input
                      value={editingCategoryName}
                      onChange={(e) =>
                        setEditingCategoryName(e.target.value)
                      }
                      style={{ padding: 10, width: 120 }}
                    />

                    <button onClick={saveCategoryName}>저장</button>

                    <button
                      onClick={() => {
                        setEditingCategory(null);
                        setEditingCategoryName("");
                        setOpenCategoryMenu(null);
                      }}
                    >
                      취소
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setActiveCategory(category)}
                      style={{
                        padding: 10,
                        backgroundColor:
                          activeCategory === category ? "#dbeafe" : "white",
                      }}
                    >
                      📁 {category} ({categoryCount(category)})
                    </button>

                    <button
                      onClick={() =>
                        setOpenCategoryMenu(
                          openCategoryMenu === category ? null : category
                        )
                      }
                      style={{ padding: "10px 12px" }}
                    >
                      ▼
                    </button>

                    {openCategoryMenu === category && (
                      <div
                        style={{
                          position: "absolute",
                          top: "42px",
                          right: 0,
                          backgroundColor: "white",
                          color: "#111827",
                          border: "1px solid #ccc",
                          borderRadius: 8,
                          padding: 8,
                          zIndex: 10,
                          boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                        }}
                      >
                        <button
                          onClick={() => startEditCategory(category)}
                          style={{
                            display: "block",
                            width: "100%",
                            marginBottom: 6,
                          }}
                        >
                          이름 수정
                        </button>

                        <button
                          onClick={() => deleteCategory(category)}
                          style={{
                            display: "block",
                            width: "100%",
                          }}
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginBottom: 15 }}>
        발음 속도: {speechRate}
        <input
          type="range"
          min="0.5"
          max="1.5"
          step="0.1"
          value={speechRate}
          onChange={(e) => setSpeechRate(Number(e.target.value))}
          style={{ width: "100%" }}
        />
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <button
          onClick={() => setActiveFolder("review")}
          style={{ flex: 1, padding: 12 }}
        >
          📌 복습중 ({reviewCount})
        </button>

        <button
          onClick={() => setActiveFolder("completed")}
          style={{ flex: 1, padding: 12 }}
        >
          ✅ 복습완료 ({completedCount})
        </button>

        <button
          onClick={() => setActiveFolder("wrong")}
          style={{ flex: 1, padding: 12 }}
        >
          ❗ 틀린 문장 ({wrongCount})
        </button>
      </div>

      <input
        placeholder="검색..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: 10,
          width: "100%",
          marginBottom: 20,
          boxSizing: "border-box",
        }}
      />

      <div
        style={{
          border: "1px solid #ccc",
          padding: 20,
          borderRadius: 10,
          marginBottom: 30,
          backgroundColor: card,
        }}
      >
        <h2 style={{ textAlign: "center" }}>새 문장 추가</h2>

        <select
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <textarea
          placeholder="한국어 문장"
          value={newKorean}
          onChange={(e) => setNewKorean(e.target.value)}
          style={{
            width: "100%",
            height: 80,
            marginBottom: 10,
            boxSizing: "border-box",
          }}
        />

        <textarea
          placeholder="영어 문장"
          value={newEnglish}
          onChange={(e) => setNewEnglish(e.target.value)}
          style={{
            width: "100%",
            height: 80,
            marginBottom: 10,
            boxSizing: "border-box",
          }}
        />

        <textarea
          placeholder="메모 / 핵심 표현 / 주의할 점"
          value={newMemo}
          onChange={(e) => setNewMemo(e.target.value)}
          style={{
            width: "100%",
            height: 70,
            marginBottom: 10,
            boxSizing: "border-box",
          }}
        />

        <button onClick={addNote} style={{ padding: 10, width: "100%" }}>
          추가하기
        </button>
      </div>

      <h2 style={{ textAlign: "center" }}>
        {activeCategory === "All" ? "전체" : activeCategory} /{" "}
        {activeFolder === "review"
          ? "복습중"
          : activeFolder === "completed"
          ? "복습완료"
          : "틀린 문장"}
      </h2>

      {filteredNotes.length === 0 && (
        <p style={{ textAlign: "center" }}>아직 내역이 없습니다.</p>
      )}

      {filteredNotes.map((note) => (
        <div
          key={note.id}
          style={{
            border: "1px solid #ddd",
            padding: 15,
            borderRadius: 10,
            marginBottom: 15,
            backgroundColor: card,
            textAlign: "center",
          }}
        >
          {note.editing ? (
            <>
              <select
                value={note.category}
                onChange={(e) =>
                  updateNote(note.id, { category: e.target.value })
                }
                style={{ width: "100%", padding: 10, marginBottom: 10 }}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <textarea
                value={note.korean}
                onChange={(e) =>
                  updateNote(note.id, { korean: e.target.value })
                }
                style={{
                  width: "100%",
                  height: 80,
                  marginBottom: 10,
                  boxSizing: "border-box",
                }}
              />

              <textarea
                value={note.english}
                onChange={(e) =>
                  updateNote(note.id, { english: e.target.value })
                }
                style={{
                  width: "100%",
                  height: 80,
                  marginBottom: 10,
                  boxSizing: "border-box",
                }}
              />

              <textarea
                value={note.memo}
                onChange={(e) => updateNote(note.id, { memo: e.target.value })}
                style={{
                  width: "100%",
                  height: 80,
                  marginBottom: 10,
                  boxSizing: "border-box",
                }}
              />

              <button onClick={() => updateNote(note.id, { editing: false })}>
                💾 저장
              </button>
            </>
          ) : (
            <>
              <p>
                <strong>날짜:</strong> {note.date}
              </p>

              <p>
                <strong>카테고리:</strong> {note.category}
              </p>

              <p>
                <strong>한국어:</strong> {note.korean}
              </p>

              <button
                onClick={() =>
                  updateNote(note.id, { showEnglish: !note.showEnglish })
                }
              >
                {note.showEnglish ? "🙈 영어 숨기기" : "👀 영어 보기"}
              </button>

              {note.showEnglish && (
                <p>
                  <strong>영어:</strong> {note.english}
                </p>
              )}

              <button
                onClick={() =>
                  updateNote(note.id, { showMemo: !note.showMemo })
                }
                style={{ marginLeft: 10 }}
              >
                {note.showMemo ? "🙈 메모 숨기기" : "📝 메모 보기"}
              </button>

              {note.showMemo && (
                <p>
                  <strong>메모:</strong> {note.memo || "메모 없음"}
                </p>
              )}

              <div style={{ marginTop: 12 }}>
                <button onClick={() => speakEnglish(note.english)}>
                  🔊 발음 듣기
                </button>

                <button
                  onClick={() => updateNote(note.id, { wrong: !note.wrong })}
                  style={{ marginLeft: 8 }}
                >
                  {note.wrong ? "❗ 틀림 해제" : "❗ 틀린 문장"}
                </button>

                <button
                  onClick={() =>
                    updateNote(note.id, {
                      completed: !note.completed,
                      showEnglish: false,
                      showMemo: false,
                    })
                  }
                  style={{ marginLeft: 8 }}
                >
                  {note.completed ? "↩️ 다시 복습" : "✅ 복습 완료"}
                </button>

                <button
                  onClick={() => updateNote(note.id, { editing: true })}
                  style={{ marginLeft: 8 }}
                >
                  ✏️ 수정
                </button>

                <button
                  onClick={() => window.open("https://chat.openai.com/", "_blank")}
                  style={{ marginLeft: 8 }}
                >
                  🤖 AI 도움받기
                </button>

                <button
                  onClick={() => deleteNote(note.id)}
                  style={{ marginLeft: 8 }}
                >
                  🗑️ 삭제
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}