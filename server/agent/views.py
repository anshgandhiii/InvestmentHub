# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import PromptSerializer, ResponseSerializer
from phi.agent import Agent
from phi.model.groq import Groq
from phi.tools.yfinance import YFinanceTools
from dotenv import load_dotenv

class FinanceAgentView(APIView):
    def post(self, request):
        # Validate input prompt
        serializer = PromptSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        prompt = serializer.validated_data['prompt']
        load_dotenv()

        # Initialize the finance agent
        finance_agent = Agent(
            name="Finance Agent",
            model=Groq(
                id="llama-3.3-70b-versatile",
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
                "6. Show data in tabular format"
            ],
            show_tool_calls=False,
            markdown=True,
            debug=False,
        )

        try:
            # Run the agent and get markdown response
            run = finance_agent.run(prompt)
            content = run.content
            # Serialize the response
            response_serializer = ResponseSerializer({'content': content})
            return Response(response_serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            # Handle errors gracefully
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)