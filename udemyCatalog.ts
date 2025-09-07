// udemyCatalog.ts
export type UdemyCourse = {
    id: string;
    title: string;
    url: string;           // Udemyの講座URL
    tags: string[];        // 上位分類
    keywords: string[];    // マッチ用語（日本語/英語混在OK）
    thumbnail?: string;    // あれば直貼り、なければOGで取得
    lang: "ja" | "en";
  };
  
  export const UDEMY_COURSES: UdemyCourse[] = [
    {
      id: "career_design_intro",
      title: "自分らしい働き方を実現しよう！キャリアデザインのはじめ方",
      url: "https://www.udemy.com/course/youronlycareerdesign/",
      tags: ["キャリア", "自己理解"],
      keywords: ["キャリア", "転職", "強み", "働き方", "リスキリング"],
      // より汎用的なプレースホルダー画像を使用
      thumbnail: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDY0IDQwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmZjc0MmYiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNmZjM5MjAiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNDAiIGZpbGw9InVybCgjZ3JhZCkiLz48Y2lyY2xlIGN4PSIzMiIgY3k9IjE1IiByPSIzIiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC44Ii8+PHRleHQgeD0iMzIiIHk9IjI3IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iOCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj7jgq3jg6Pjg6rjgqI8L3RleHQ+PHRleHQgeD0iMzIiIHk9IjM0IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNiIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuOSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+RGVzaWduPC90ZXh0Pjwvc3ZnPg==",
      lang: "ja",
    },
    {
      id: "habit_minimum_5min",
      title: "１日５分のミニマム習慣術",
      url: "https://www.udemy.com/topic/habits/",
      tags: ["習慣化", "行動設計"],
      keywords: ["習慣", "継続", "三日坊主", "目標", "行動科学"],
      thumbnail: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDY0IDQwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQyIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjNWM2YmM1Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjNDA0NjlmIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjQwIiBmaWxsPSJ1cmwoI2dyYWQyKSIvPjxjaXJjbGUgY3g9IjMyIiBjeT0iMTUiIHI9IjMiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjgiLz48dGV4dCB4PSIzMiIgeT0iMjciIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSI4IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPuevv+aFozwvdGV4dD48dGV4dCB4PSIzMiIgeT0iMzQiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSI2IiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC45IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5IYWJpdHM8L3RleHQ+PC9zdmc+",
      lang: "ja",
    },
    {
      id: "designthinking_practice",
      title: "【実践】今日から使えるデザイン思考",
      url: "https://www.udemy.com/course/designthinking_basics/",
      tags: ["デザイン思考", "問題解決", "実装"],
      keywords: ["アイデア", "共感", "プロトタイプ", "ユーザー起点"],
      thumbnail: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDY0IDQwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQzIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZmJhZDE4Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjZGQ2YjIwIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjQwIiBmaWxsPSJ1cmwoI2dyYWQzKSIvPjxjaXJjbGUgY3g9IjMyIiBjeT0iMTUiIHI9IjMiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjgiLz48dGV4dCB4PSIzMiIgeT0iMjciIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSI4IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPuODh+OCtuOCpOODszwvdGV4dD48dGV4dCB4PSIzMiIgeT0iMzQiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSI2IiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC45IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5EZXNpZ248L3RleHQ+PC9zdmc+",
      lang: "ja",
    },
    {
      id: "startup_strategy_vc",
      title: "【現役VC】スタートアップ経営戦略（立ち上げ編）",
      url: "https://www.udemy.com/course/start-up_strategy/",
      tags: ["起業", "戦略"],
      keywords: ["起業", "PMF", "資金調達", "戦略", "ビジネスモデル"],
      thumbnail: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDY0IDQwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQ0IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMzRkMzk5Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMDU5NjY5Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjQwIiBmaWxsPSJ1cmwoI2dyYWQ0KSIvPjxjaXJjbGUgY3g9IjMyIiBjeT0iMTUiIHI9IjMiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjgiLz48dGV4dCB4PSIzMiIgeT0iMjciIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSI4IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPui1tyDljJY8L3RleHQ+PHRleHQgeD0iMzIiIHk9IjM0IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNiIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuOSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+U3RhcnR1cDwvdGV4dD48L3N2Zz4=",
      lang: "ja",
    },
    {
      id: "ikigai_find_purpose_en",
      title: "IKIGAI - Find Your Life Purpose",
      url: "https://www.udemy.com/course/ikigai-find-your-life-purpose/",
      tags: ["自己理解", "Ikigai"],
      keywords: ["ikigai", "purpose", "自己実現", "生きがい"],
      thumbnail: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDY0IDQwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQ1IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZjQ3MmI2Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjYmUxODVkIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjQwIiBmaWxsPSJ1cmwoI2dyYWQ1KSIvPjxjaXJjbGUgY3g9IjMyIiBjeT0iMTUiIHI9IjMiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjgiLz48dGV4dCB4PSIzMiIgeT0iMjciIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSI4IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPuS6uuecn+OBruOBguOCi+OBmeOBguOBkzwvdGV4dD48dGV4dCB4PSIzMiIgeT0iMzQiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSI2IiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC45IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5JS0lHQUk8L3RleHQ+PC9zdmc+",
      lang: "en",
    },
    {
      id: "python_basics",
      title: "【初心者向け】Pythonプログラミング入門",
      url: "https://www.udemy.com/course/python-basics/",
      tags: ["プログラミング", "Python"],
      keywords: ["プログラミング", "python", "コード", "開発", "アプリ", "ウェブ", "データ分析", "AI", "機械学習"],
      thumbnail: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDY0IDQwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQ2IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMzc3NmFiIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMjU2M2ViIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjQwIiBmaWxsPSJ1cmwoI2dyYWQ2KSIvPjxjaXJjbGUgY3g9IjMyIiBjeT0iMTUiIHI9IjMiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjgiLz48dGV4dCB4PSIzMiIgeT0iMjciIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSI4IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPuODh+OCtuOCpOODszwvdGV4dD48dGV4dCB4PSIzMiIgeT0iMzQiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSI2IiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC45IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5QeXRob248L3RleHQ+PC9zdmc+",
      lang: "ja",
    },
    {
      id: "javascript_web_development",
      title: "【実践】JavaScriptでウェブアプリ開発",
      url: "https://www.udemy.com/course/javascript-web-development/",
      tags: ["プログラミング", "JavaScript", "ウェブ開発"],
      keywords: ["プログラミング", "javascript", "js", "ウェブ", "web", "アプリ", "開発", "フロントエンド", "バックエンド", "nodejs"],
      thumbnail: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDY0IDQwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQ3IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZmVkYzA0Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjZjUYzA0Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjQwIiBmaWxsPSJ1cmwoI2dyYWQ3KSIvPjxjaXJjbGUgY3g9IjMyIiBjeT0iMTUiIHI9IjMiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjgiLz48dGV4dCB4PSIzMiIgeT0iMjciIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSI4IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPuODh+OCtuOCpOODszwvdGV4dD48dGV4dCB4PSIzMiIgeT0iMzQiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSI2IiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC45IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5KYXZhU2NyaXB0PC90ZXh0Pjwvc3ZnPg==",
      lang: "ja",
    },
    {
      id: "react_modern_web",
      title: "【最新版】Reactでモダンウェブアプリを作ろう",
      url: "https://www.udemy.com/course/react-modern-web/",
      tags: ["プログラミング", "React", "フロントエンド"],
      keywords: ["プログラミング", "react", "フロントエンド", "ui", "コンポーネント", "spa", "ウェブアプリ", "開発"],
      thumbnail: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDY0IDQwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQ4IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjNjFkYWZiIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMjE5NmYzIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjQwIiBmaWxsPSJ1cmwoI2dyYWQ4KSIvPjxjaXJjbGUgY3g9IjMyIiBjeT0iMTUiIHI9IjMiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjgiLz48dGV4dCB4PSIzMiIgeT0iMjciIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSI4IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPuODh+OCtuOCpOODszwvdGV4dD48dGV4dCB4PSIzMiIgeT0iMzQiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSI2IiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC45IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5SZWFjdDwvdGV4dD48L3N2Zz4=",
      lang: "ja",
    },
    // …（上のリストを同様に追加）
  ];
  
  // 超軽量マッチ（タグ一致×2点、キーワード部分一致×1点）
  export function recommendCourses(input: string, topN = 6): UdemyCourse[] {
    console.log('🔍 recommendCourses called with:', input);
    const q = input.toLowerCase();
    const score = (c: UdemyCourse) => {
      let s = 0;
      for (const t of c.tags) if (q.includes(t.toLowerCase())) s += 2;
      for (const k of c.keywords) if (q.includes(k.toLowerCase())) s += 1;
      
      // 一般的な学習キーワードでマッチしない場合のフォールバック
      if (s === 0) {
        // 学習・成長系キーワード
        if (/学ぶ|勉強|講座|コース|学習|スキル|成長|上達|習得|身につけ|レベルアップ/.test(input)) {
          console.log('📖 Matched learning keywords, setting score to 1');
          s = 1;
        }
        // プログラミング系キーワード
        else if (/プログラミング|コード|開発|アプリ|ウェブ|web|python|javascript|react/.test(input)) {
          console.log('💻 Matched programming keywords, setting score to 1');
          s = 1;
        }
        // キャリア・ビジネス系キーワード
        else if (/キャリア|転職|働き方|起業|ビジネス|戦略|目標|夢/.test(input)) {
          console.log('💼 Matched career keywords, setting score to 1');
          s = 1;
        }
        // テスト・デバッグ系キーワード
        else if (/テスト|test|デバッグ|debug|問題解決|解決/.test(input)) {
          console.log('🧪 Matched test keywords, setting score to 1');
          s = 1;
        }
      }
      return s;
    };
    
    const scoredCourses = [...UDEMY_COURSES]
      .map(c => ({ c, s: score(c) }))
      .sort((a, b) => b.s - a.s)
      .filter(x => x.s > 0);
    
    console.log('📊 Scored courses:', scoredCourses.map(sc => ({ title: sc.c.title, score: sc.s })));
    
    // スコアが0の場合は、ランダムにいくつかの講座を返す
    if (scoredCourses.length === 0) {
      console.log('🎲 No scored courses, returning random courses');
      const shuffled = [...UDEMY_COURSES].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, Math.min(topN, 3));
    }
    
    const result = scoredCourses.slice(0, topN).map(x => x.c);
    console.log('✅ Final recommended courses:', result.map(c => c.title));
    return result;
  }

  // === TEAM MODIFICATION START ===
  // 前向きキーワード検出関数（チーム開発用・強化版）
  export function detectPositiveKeywords(message: string): boolean {
    console.log('🔍 Checking message for positive keywords:', message);
    
    const positiveKeywords = [
      // やる気系（ひらがな・カタカナ・漢字バリエーション）
      'やりたい', 'やってみたい', 'がんばる', 'がんばりたい', 'やる気', 'モチベーション',
      'チャレンジ', '挑戦', '頑張る', '頑張りたい', 'やってみよう', 'やろう', 'ガンバ',
      
      // 学習・成長系
      '学びたい', '勉強したい', '身につけたい', 'スキルアップ', '成長したい', 
      '上達したい', '向上させたい', 'レベルアップ', '習得したい', '学ぶ', '勉強',
      
      // 前向き・未来系
      '新しい', '始めたい', 'スタートしたい', '取り組みたい', '実現したい',
      '達成したい', '目指したい', '夢', '目標', 'ゴール', '理想', '始める', 'スタート',
      
      // 感情系（ポジティブ）
      'ワクワク', 'わくわく', '楽しそう', '面白そう', '興味深い', 'いいな',
      '素敵', '憧れ', 'かっこいい', 'すごい', '感動', '楽しい', '面白い',
      
      // 簡単なテスト用キーワード
      'テスト', 'test', 'Udemy', 'udemy', '講座'
    ];
    
    console.log('📝 Available keywords:', positiveKeywords);
    
    // より柔軟なマッチング（部分一致でも検出）
    const normalizedMessage = message.toLowerCase();
    console.log('🔤 Normalized message:', normalizedMessage);
    
    const hasKeyword = positiveKeywords.some(keyword => {
      const normalizedKeyword = keyword.toLowerCase();
      const found = normalizedMessage.includes(normalizedKeyword);
      if (found) {
        console.log('✅ Found keyword:', keyword, 'in message:', message);
      }
      return found;
    });
    
    console.log('🎯 Detection result:', hasKeyword);
    return hasKeyword;
  }

  // Udemy案内メッセージ生成（子供らしい優しいトーン・サムネイル付き）
  export function generateUdemySuggestion(_userMessage: string, courses: UdemyCourse[]): string | null {
    if (courses.length === 0) return null;
    
    const childLikeSuggestions = [
      'あ、そうそう！そういえばね、',
      'それで思い出したんだけど、',
      'あ！そういうのに興味あるなら、',
      'わー、それってすごくいいね！あのね、',
      'うんうん！がんばって！あ、そうだ、'
    ];
    
    const randomIntro = childLikeSuggestions[Math.floor(Math.random() * childLikeSuggestions.length)];
    const topCourse = courses[0];
    
    return `${randomIntro}こんなのがあるって知ってた？「${topCourse.title}」っていうのがあるんだって！なんか君にぴったりな感じがするよ〜。気になったら見てみて！`;
  }

  // サムネイル付きUdemy講座情報を返す関数
  export function getUdemyCourseWithThumbnail(userMessage: string): UdemyCourse | null {
    console.log('🎯 getUdemyCourseWithThumbnail called with:', userMessage);
    const courses = recommendCourses(userMessage, 1);
    console.log('📚 Recommended courses:', courses);
    const result = courses.length > 0 ? courses[0] : null;
    console.log('✅ Final course result:', result);
    return result;
  }
  // === TEAM MODIFICATION END ===

// カテゴリから講座を選択する関数
export function selectCourseByCategory(category: string): UdemyCourse | null {
  console.log('🎯 Selecting course for category:', category);
  
  const categoryMap: { [key: string]: string[] } = {
    'プログラミング': ['python_basics', 'javascript_web_development', 'react_modern_web'],
    'キャリア': ['career_design_intro'],
    '習慣': ['habit_minimum_5min'],
    'デザイン': ['designthinking_practice'],
    '起業': ['startup_strategy_vc'],
    '自己理解': ['ikigai_find_purpose_en', 'career_design_intro'],
    '成長': ['habit_minimum_5min', 'career_design_intro'],
    '学習': ['python_basics', 'javascript_web_development', 'react_modern_web'],
    'デフォルト': ['career_design_intro', 'habit_minimum_5min', 'python_basics'] // フォールバック
  };
  
  // カテゴリの正規化
  const normalizedCategory = category.trim();
  const courseIds = categoryMap[normalizedCategory] || categoryMap['デフォルト'];
  
  if (courseIds.length === 0) {
    console.log('❌ No courses found for category:', normalizedCategory);
    return null;
  }
  
  // ランダムに1つ選択
  const randomId = courseIds[Math.floor(Math.random() * courseIds.length)];
  const selectedCourse = UDEMY_COURSES.find(c => c.id === randomId);
  
  console.log('✅ Selected course:', selectedCourse?.title);
  return selectedCourse || null;
}
  