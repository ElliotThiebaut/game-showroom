module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          red: '#E62953',
          purple: '#881342',
          pink: '#FBE1E7',
        },
        secondary: {
          yellow: '#FAB50D',
          orange: '#F5A26A'
        }
      },
      fontFamily: {
        'title': 'Exo, sans-serif',
        'subtitle': 'Heebo, sans-serif',
        'text': 'Source Sans Pro, sans-serif'
      },
      screens: {
        '3xl': '1700px'
      },
    },
  },
  plugins: [],
}
