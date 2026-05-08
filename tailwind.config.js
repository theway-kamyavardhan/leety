module.exports = {
  darkMode: 'class',
  content: ['./index.html', './api/**/*.js', './server.js'],
  theme: {
    extend: {
      colors: {
        ink: '#0e1117',
        panel: '#161b22',
        line: '#30363d',
        brand: '#2f81f7',
        mint: '#2ea043',
        warn: '#d29922',
        danger: '#f85149'
      }
    }
  },
  plugins: []
};
