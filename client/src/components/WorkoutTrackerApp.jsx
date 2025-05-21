import { useState, useEffect } from "react";

export default function WorkoutTrackerApp() {
  console.log("Rendering WorkoutTrackerApp");
  // 状態管理
  const [exerciseList, setExerciseList] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState("");
  const [exerciseData, setExerciseData] = useState({});
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [sets, setSets] = useState("");
  const [records, setRecords] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isLoading, setIsLoading] = useState(true);

  // マスタデータベースからエクササイズ情報を取得（ここではモック）
  useEffect(() => {
    // 実際の実装では、Notion APIを呼び出してデータを取得

    // モックデータの作成 (実際の実装ではここをAPI呼び出しに置き換え)
    const mockExerciseData = [
      {
        id: "1efa22da-5f16-8099-9ab9-ec97ea6856e4",
        name: "Seated Leg Curl",
        bodyPart: "Legs",
        type: "Gym",
      },
      {
        id: "1efa22da-5f16-80eb-9cc1-e1cf89ceeb97",
        name: "Glute",
        bodyPart: "Legs",
        type: "Gym",
      },
      {
        id: "1efa22da-5f16-809b-ba3c-fee0f386dc6a",
        name: "Leg press",
        bodyPart: "Legs",
        type: "Gym",
      },
      {
        id: "1eca22da-5f16-80e9-baac-eaf191555a9a",
        name: "Lat Pull",
        bodyPart: "Shoulders",
        type: "Gym",
      },
      {
        id: "1eca22da-5f16-80fe-bcec-cfa8cf19195f",
        name: "Row",
        bodyPart: "Shoulders",
        type: "Gym",
      },
      {
        id: "1eca22da-5f16-8011-a6fe-efaf82e00d4f",
        name: "Dumbbell Dead Lift",
        bodyPart: "Shoulders",
        type: "Dumbbells",
      },
      {
        id: "1eca22da-5f16-80e0-9c8e-dc9fb785dddc",
        name: "Back Extention",
        bodyPart: "Shoulders",
        type: "Gym",
      },
      {
        id: "1eca22da-5f16-8070-ad64-ca984ceee55f",
        name: "EAGLE",
        bodyPart: "Shoulders",
        type: "Gym",
      },
    ];

    // エクササイズリストを設定
    setExerciseList(mockExerciseData);

    // エクササイズデータをIDをキーにしたオブジェクトに変換
    const exerciseDataMap = {};
    mockExerciseData.forEach((exercise) => {
      exerciseDataMap[exercise.id] = exercise;
    });
    setExerciseData(exerciseDataMap);

    setIsLoading(false);
  }, []);

  // 日付フォーマット関数（YYYY/MM/DD形式）
  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  };

  // 今日の日付
  const today = formatDate(new Date());

  // レップ数とセット数の選択肢を定義
  const repOptions = [5, 10, 15, 20];
  const setOptions = [1, 2, 3, 4, 5];

  // フォーム送信処理
  const handleSubmit = async () => {
    setIsSubmitting(true);

    // 必須項目の検証
    if (!selectedExercise || !weight || !reps || !sets) {
      setMessage({ text: "必須項目を入力してください", type: "error" });
      setIsSubmitting(false);
      return;
    }

    const exercise = exerciseData[selectedExercise];

    // 新しいレコードオブジェクト
    const newRecord = {
      id: Date.now(),
      date: today,
      exerciseId: selectedExercise,
      exerciseName: exercise.name,
      bodyPart: exercise.bodyPart,
      type: exercise.type,
      weight: parseFloat(weight),
      reps: parseInt(reps),
      sets: parseInt(sets),
      timestamp: new Date().toLocaleString("ja-JP"),
    };

    // レコードを保存
    setRecords((prevRecords) => [...prevRecords, newRecord]);

    // ✅ ここから Notion送信用の構造を作成（mock）
    const notionPayload = {
      parent: {
        database_id: "1eca22da5f16800db2a9f27d44663d36",
      },
      properties: {
        "Exercise Name": {
          title: [{ text: { content: today } }],
        },
        "Work out Name": {
          relation: [{ id: selectedExercise }],
        },
        "Weight(kg)": { number: parseFloat(weight) },
        Reps: { number: parseInt(reps) },
        Sets: { number: parseInt(sets) },
      },
    };

    console.log(
      "🔥 Notionへ送信される想定のデータです:",
      JSON.stringify(notionPayload, null, 2)
    );

    // Notion APIへの接続（サーバー経由）リクエストを追加
    const reqURL = "https://musclereport.onrender.com/api/submit";
    console.log("リクエストURL:");
    console.log(reqURL);
    try {
      const response = await fetch(reqURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notionPayload),
      });

      const data = await response.json();
      console.log("サーバーからの応答:", data);
    } catch (error) {
      console.error("送信中にエラーが発生:", error);
      setMessage({ text: "サーバーへの送信に失敗しました", type: "error" });
    }

    // 成功メッセージ表示
    setMessage({ text: "ワークアウトを記録しました！", type: "success" });

    // fetch("https://api.notion.com/v1/pages", {
    //   method: "POST",
    //   headers: {
    //     Authorization:
    //       "Bearer API_KEY", // ← あなたのシークレットに置換
    //     "Content-Type": "application/json",
    //     "Notion-Version": "2022-06-28",
    //   },
    //   body: JSON.stringify(notionPayload),
    // })
    //   .then((res) => {
    //     if (!res.ok) {
    //       throw new Error("Notion API request failed");
    //     }
    //     return res.json();
    //   })
    //   .then((data) => {
    //     console.log("✅ Notionへ送信成功:", data);
    //   })
    //   .catch((err) => {
    //     console.error("❌ Notionへの送信失敗:", err);
    //   });

    // Notion APIへの接続コメント（実際の実装では必要）
    console.log("Notionに保存するデータ:", {
      database_id: "1eca22da5f1680f681a5d2623694d71a",
      properties: {
        "Exercise Name": { title: [{ text: { content: today } }] },
        "Work out Name": { rich_text: [{ text: { content: exercise.name } }] },
        "Body Part": { rich_text: [{ text: { content: exercise.bodyPart } }] },
        "Weight(kg)": { number: parseFloat(weight) },
        Reps: { number: parseInt(reps) },
        Sets: { number: parseInt(sets) },
        Types: { rich_text: [{ text: { content: exercise.type } }] },
      },
    });

    // フォームリセット
    setSelectedExercise("");
    setWeight("");
    setReps("");
    setSets("");
    setIsSubmitting(false);

    // 成功メッセージを5秒後に消す
    setTimeout(() => {
      setMessage({ text: "", type: "" });
    }, 5000);
  };

  // 記録の削除
  const deleteRecord = (id) => {
    setRecords((prevRecords) =>
      prevRecords.filter((record) => record.id !== id)
    );
    setMessage({ text: "記録を削除しました", type: "info" });
    setTimeout(() => {
      setMessage({ text: "", type: "" });
    }, 3000);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-center mb-6">
        ワークアウト記録アプリ
      </h1>

      {/* メッセージ表示エリア */}
      {message.text && (
        <div
          className={`p-3 rounded mb-4 ${
            message.type === "success"
              ? "bg-green-100 text-green-800"
              : message.type === "error"
              ? "bg-red-100 text-red-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* ローディング表示 */}
      {isLoading ? (
        <div className="bg-white p-4 rounded-lg shadow mb-6 text-center">
          <p>エクササイズデータを読み込み中...</p>
        </div>
      ) : (
        /* 入力フォーム */
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">
            新しいワークアウトを記録
          </h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                エクササイズ <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">エクササイズを選択</option>
                {exerciseList.map((exercise) => (
                  <option key={exercise.id} value={exercise.id}>
                    {exercise.name} ({exercise.bodyPart} - {exercise.type})
                  </option>
                ))}
              </select>
              {selectedExercise && (
                <div className="mt-2 text-sm text-gray-600">
                  <p>部位: {exerciseData[selectedExercise]?.bodyPart}</p>
                  <p>種類: {exerciseData[selectedExercise]?.type}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                重量 (kg) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 50"
                min="0"
                step="0.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                レップ数 <span className="text-red-500">*</span>
              </label>
              <select
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">レップ数を選択</option>
                {repOptions.map((rep) => (
                  <option key={rep} value={rep}>
                    {rep}回
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                セット数 <span className="text-red-500">*</span>
              </label>
              <select
                value={sets}
                onChange={(e) => setSets(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">セット数を選択</option>
                {setOptions.map((set) => (
                  <option key={set} value={set}>
                    {set}セット
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6">
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={`w-full py-2 px-4 rounded-md shadow-sm text-white font-medium transition-colors duration-200
            ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gray-600 hover:bg-gray-700"
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500`}
                  >
                    {isSubmitting ? "記録中..." : "記録する"}
                  </button>
          </div>
        </div>
      )}
      {/* 記録表示 */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">今日のワークアウト記録</h2>

        {records.length === 0 ? (
          <p className="text-gray-500 text-center py-4">まだ記録がありません</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">エクササイズ</th>
                  <th className="px-4 py-2 text-left">部位</th>
                  <th className="px-4 py-2 text-center">重量(kg)</th>
                  <th className="px-4 py-2 text-center">レップ</th>
                  <th className="px-4 py-2 text-center">セット</th>
                  <th className="px-4 py-2 text-center">種類</th>
                  <th className="px-4 py-2 text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-t">
                    <td className="px-4 py-2">{record.exerciseName}</td>
                    <td className="px-4 py-2">{record.bodyPart}</td>
                    <td className="px-4 py-2 text-center">{record.weight}</td>
                    <td className="px-4 py-2 text-center">{record.reps}</td>
                    <td className="px-4 py-2 text-center">{record.sets}</td>
                    <td className="px-4 py-2 text-center">{record.type}</td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => deleteRecord(record.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Notion連携説明 */}
      <div className="mt-6 bg-blue-50 p-4 rounded-lg text-sm">
        <h3 className="font-medium mb-2">Notion連携について</h3>
        <p>
          このアプリは、Notionデータベースと連携するように設計されています。完全な連携には以下が必要です：
        </p>
        <ol className="list-decimal pl-5 mt-2 space-y-1">
          <li>Notionで統合アプリを作成し、APIキーを取得</li>
          <li>
            データベースID「1eca22da5f1680f681a5d2623694d71a」へのアクセス権を設定
          </li>
          <li>
            セキュリティ上の理由から、バックエンドサーバー経由でAPIを呼び出す必要あり
          </li>
        </ol>
        <p className="mt-2">
          現在のデモでは、モックデータを使用してUIを表示しています。実際の連携にはバックエンドAPIの実装が必要です。
        </p>
      </div>
    </div>
  );
}
