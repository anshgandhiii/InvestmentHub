from phi.agent import Agent
from phi.model.groq import Groq
from phi.tools.yfinance import YFinanceTools
from dotenv import load_dotenv

load_dotenv()

# Configure with valid yfinance tools
finance_agent = Agent(
    name="Finance Agent",
    model=Groq(
        id="llama-3.3-70b-versatile",
        # id="mixtral-8x7b-32768",
        temperature=0.4,
        max_tokens=2048,
    ),
    tools=[YFinanceTools(
        stock_price=True,
        analyst_recommendations=True,
        company_info=True,
        company_news=True,
    )],
    instructions=[
        "1. Collect financial data using available tools",
        "2. Compare companies systematically",
        "3. Present data in markdown tables",
        "4. Include data sources and dates",
        "5. Highlight key metrics",
        "6. show data in tabular format"
    ],
    show_tool_calls=True,
    markdown=True,
    debug=True,
)

try:
    run = finance_agent.run(prompt)
    print(run.content)
except Exception as e:
    print(f"Error: {e}")