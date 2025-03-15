import React, { useEffect, useState, useCallback } from 'react';

function News() {
  // State for filter parameters
  const [tickers, setTickers] = useState('AAPL,MSFT');
  const [topics, setTopics] = useState('');
  const [timeFrom, setTimeFrom] = useState('');
  const [timeTo, setTimeTo] = useState('');
  const [sort, setSort] = useState('LATEST');
  const [limit, setLimit] = useState(50);
  const [selectedSentiment, setSelectedSentiment] = useState('All');

  // State for fetch status and results
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Alpha Vantage API key (replace with your own valid key in production)
  const apiKey = 'OVH195S2573METPL';

  // Build the API URL based on current state
  const buildApiUrl = useCallback(() => {
    let url = 'https://www.alphavantage.co/query?function=NEWS_SENTIMENT';
    if (tickers) url += `&tickers=${tickers}`;
    if (topics) url += `&topics=${topics}`;
    if (timeFrom) url += `&time_from=${timeFrom}`;
    if (timeTo) url += `&time_to=${timeTo}`;
    url += `&sort=${sort}`;
    url += `&limit=${limit}`;
    url += `&apikey=${apiKey}`;
    return url;
  }, [tickers, topics, timeFrom, timeTo, sort, limit, apiKey]);

  // Fetch news based on current filters
  const fetchNews = useCallback(() => {
    setLoading(true);
    setError(null);
    const apiUrl = buildApiUrl();

    fetch(apiUrl)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
      })
      .then(data => {
        if (data['Error Message']) throw new Error(data['Error Message']);
        if (data['Information']) throw new Error(data['Information']);
        const articles = data.feed || [];
        setNews(articles);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setNews([]);
        setLoading(false);
      });
  }, [buildApiUrl]);

  // Fetch news on component mount
  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // Calculate average sentiment score for an article
  const calculateAverageSentiment = (article) => {
    const specifiedTickers = tickers ? tickers.split(',').map(t => t.trim().toUpperCase()) : [];
    const tickerSentiments = article.ticker_sentiment.filter(ts =>
      specifiedTickers.length === 0 || specifiedTickers.includes(ts.ticker)
    );
    if (tickerSentiments.length === 0) return 0;
    const totalSentiment = tickerSentiments.reduce((sum, ts) => sum + parseFloat(ts.ticker_sentiment_score), 0);
    return totalSentiment / tickerSentiments.length;
  };

  // Determine border color based on sentiment
  const getBorderColor = (avgSentiment) => {
    if (avgSentiment > 0.05) return 'green';
    if (avgSentiment < -0.05) return 'red';
    return 'blue';
  };

  // Filter news based on selected sentiment
  const filteredNews = selectedSentiment === 'All'
    ? news
    : news.filter(article => {
        const avgSentiment = calculateAverageSentiment(article);
        if (selectedSentiment === 'Positive') return avgSentiment > 0.05;
        if (selectedSentiment === 'Neutral') return avgSentiment >= -0.05 && avgSentiment <= 0.05;
        if (selectedSentiment === 'Negative') return avgSentiment < -0.05;
        return false;
      });

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Stock News Filter</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="flex flex-col">
          <label className="mb-1 text-gray-700">Tickers (comma-separated):</label>
          <input
            type="text"
            value={tickers}
            onChange={e => setTickers(e.target.value)}
            placeholder="e.g., AAPL,MSFT"
            className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1 text-gray-700">Topics (comma-separated):</label>
          <input
            type="text"
            value={topics}
            onChange={e => setTopics(e.target.value)}
            placeholder="e.g., technology,ipo"
            className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1 text-gray-700">Time From (YYYYMMDDTHHMM):</label>
          <input
            type="text"
            value={timeFrom}
            onChange={e => setTimeFrom(e.target.value)}
            placeholder="e.g., 20230101T0000"
            className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1 text-gray-700">Time To (YYYYMMDDTHHMM):</label>
          <input
            type="text"
            value={timeTo}
            onChange={e => setTimeTo(e.target.value)}
            placeholder="e.g., 20231231T2359"
            className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1 text-gray-700">Sort:</label>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="LATEST">Latest</option>
            <option value="EARLIEST">Earliest</option>
            <option value="RELEVANCE">Relevance</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="mb-1 text-gray-700">Limit (1-1000):</label>
          <input
            type="number"
            value={limit}
            onChange={e => setLimit(Math.min(1000, Math.max(1, e.target.value)))}
            min="1"
            max="1000"
            className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1 text-gray-700">Sentiment:</label>
          <select
            value={selectedSentiment}
            onChange={e => setSelectedSentiment(e.target.value)}
            className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All</option>
            <option value="Positive">Positive</option>
            <option value="Neutral">Neutral</option>
            <option value="Negative">Negative</option>
          </select>
        </div>
        <button
          type="button"
          onClick={fetchNews}
          className="col-span-full md:col-span-1 lg:col-span-1 p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200"
        >
          Fetch News
        </button>
      </div>

      {loading ? (
        <p className="text-center text-blue-600 font-medium">Loading stock news...</p>
      ) : error ? (
        <p className="text-center text-red-600 font-medium">Error fetching news: {error}</p>
      ) : filteredNews.length === 0 ? (
        <p className="text-center text-gray-600">No news articles found. Check filters or API key.</p>
      ) : (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Latest Stock News</h2>
          {filteredNews.map((article, index) => {
            const avgSentiment = calculateAverageSentiment(article);
            const borderColor = getBorderColor(avgSentiment);
            return (
              <div
                key={index}
                className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition duration-200"
                style={{ border: `2px solid ${borderColor}` }}
              >
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-semibold text-blue-600 hover:underline"
                >
                  {article.title}
                </a>
                <p className="text-gray-700 mt-2">{article.summary || 'No summary available.'}</p>
                <small className="text-gray-500 mt-2 block">
                  {article.time_published ? new Date(article.time_published).toLocaleString() : 'No date available'}
                </small>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default News;