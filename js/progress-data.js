// 시안용 더미 데이터. 백엔드가 붙으면 이 객체들을 API 응답으로 바꾼다. (home, curriculum 공용)
const PROGRESS = {
  user: 'Alex',
  streak: 3, xp: 20, xpGoal: 50,
  // 마지막 제출. 제출 이력이 없는 신규 사용자는 null
  last: { week: 1, id: 5, result: 'Wrong Answer', at: 'Nov 21, 14:32' },
}

const WEEKS = [
  { n: '1', course: 'Intro to Programming, Python', libs: 'None (pure Python)', project: 'Number guessing game, word count', total: 12, solved: 4,
    problems: [
      { id: 1, title: 'Hello, World', level: 'Easy', done: true },
      { id: 2, title: 'Sum of Two Numbers', level: 'Easy', done: true },
      { id: 3, title: 'Reverse a String', level: 'Easy', done: true },
      { id: 4, title: 'FizzBuzz', level: 'Easy', done: true },
      { id: 5, title: 'Count the Vowels', level: 'Medium', done: false },
      { id: 6, title: 'Mean of a List', level: 'Easy', done: false },
    ] },
  { n: '2', course: 'Pandas', libs: 'pandas', project: 'Average wine review score by country', total: 10, solved: 0, problems: [] },
  { n: '3', course: 'Data Visualization, Data Cleaning', libs: 'matplotlib, seaborn, pandas', project: 'Fill missing values, then draw bar and line charts', total: 10, solved: 0, problems: [] },
  { n: '4', course: 'Intro to Machine Learning', libs: 'scikit-learn, pandas', project: 'House price prediction with a decision tree', total: 10, solved: 0, problems: [] },
  { n: '5–6', course: 'Intermediate ML, Feature Engineering, Time Series', optional: true, libs: 'scikit-learn, pandas', project: 'Missing and categorical data pipeline, moving average', total: 8, solved: 0, problems: [] },
]

const pad2 = (n) => String(n).padStart(2, '0')
