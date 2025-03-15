import { useState } from "react";
import {
  BookOpen,
  Video,
  FileText,
  TrendingUp,
  Search,
  BarChart2,
  Clock,
  ChevronRight,
  Play,
} from "lucide-react";

export default function Learning() {
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [stockPrice, setStockPrice] = useState(150.75);
  const [shares, setShares] = useState(0);
  const [activeTab, setActiveTab] = useState("ebooks");

  const resources = {
    ebooks: [
      {
        id: 1,
        title: "Fundamentals of Investment",
        description: "Learn the basics of investment strategies and portfolio management.",
        difficulty: "beginner",
        duration: "3 hours",
        progress: 0,
        author: "Sarah Johnson",
        image: "https://picsum.photos/200",
      },
      {
        id: 2,
        title: "Technical Analysis Mastery",
        description: "Advanced chart patterns and technical indicators for experienced traders.",
        difficulty: "advanced",
        duration: "5 hours",
        progress: 25,
        author: "Michael Chen",
        image: "https://picsum.photos/200",
      },
      {
        id: 3,
        title: "Asset Allocation Strategies",
        description: "Optimize your portfolio with proven asset allocation methods.",
        difficulty: "intermediate",
        duration: "4 hours",
        progress: 75,
        author: "Robert Kiyosaki",
        image: "https://picsum.photos/200",
      },
    ],
    videos: [
      {
        id: 1,
        title: "Candlestick Patterns Explained",
        description: "Visual guide to identifying and trading with candlestick patterns.",
        difficulty: "intermediate",
        duration: "45 minutes",
        progress: 50,
        author: "Trading Academy",
        image: "https://picsum.photos/200",
      },
      {
        id: 2,
        title: "Day Trading for Beginners",
        description: "Step-by-step guide to start day trading safely and effectively.",
        difficulty: "beginner",
        duration: "1.5 hours",
        progress: 10,
        author: "Market Masters",
        image: "https://picsum.photos/200",
      },
      {
        id: 3,
        title: "Options Trading Strategies",
        description: "Advanced options strategies for maximizing returns and hedging risk.",
        difficulty: "advanced",
        duration: "2 hours",
        progress: 0,
        author: "Options Pro",
        image: "https://picsum.photos/200",
      },
    ],
    articles: [
      {
        id: 1,
        title: "Market Sentiment Indicators",
        description: "How to read and utilize market sentiment for better trading decisions.",
        difficulty: "intermediate",
        duration: "15 minutes",
        progress: 100,
        author: "Financial Times",
        image: "https://picsum.photos/200",
      },
      {
        id: 2,
        title: "Risk Management Essentials",
        description: "Protect your capital with these essential risk management techniques.",
        difficulty: "beginner",
        duration: "10 minutes",
        progress: 0,
        author: "Investopedia",
        image: "https://picsum.photos/200",
      },
      {
        id: 3,
        title: "Algorithmic Trading Systems",
        description: "Building and implementing your own algorithmic trading systems.",
        difficulty: "advanced",
        duration: "25 minutes",
        progress: 30,
        author: "Quant Magazine",
        image: "https://picsum.photos/200",
      },
    ],
  };

  const filterResources = (resourceList) => {
    return resourceList.filter((resource) => {
      const matchesSearch =
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDifficulty = difficultyFilter === "all" || resource.difficulty === difficultyFilter;
      return matchesSearch && matchesDifficulty;
    });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-500";
      case "intermediate":
        return "bg-blue-500";
      case "advanced":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  // UI Components
  const Tabs = ({ children }) => <div className="w-full">{children}</div>;
  
  const TabsList = ({ children }) => (
    <div className="grid grid-cols-4 mb-8 gap-1 bg-muted p-1 rounded-lg">
      {children}
    </div>
  );

  const TabsTrigger = ({ value, children }) => (
    <button
      onClick={() => setActiveTab(value)}
      className={`flex items-center justify-center gap-2 p-2 rounded-md ${
        activeTab === value ? "bg-background text-foreground shadow" : "text-muted-foreground"
      }`}
    >
      {children}
    </button>
  );

  const TabsContent = ({ value, children }) => 
    activeTab === value && <div className="space-y-4">{children}</div>;

  const Card = ({ children }) => (
    <div className="bg-background rounded-lg shadow-sm border">{children}</div>
  );

  const CardHeader = ({ children }) => (
    <div className="p-6 space-y-1 border-b">{children}</div>
  );

  const CardTitle = ({ children }) => (
    <h3 className="text-lg font-semibold">{children}</h3>
  );

  const CardDescription = ({ children }) => (
    <p className="text-sm text-muted-foreground">{children}</p>
  );

  const CardContent = ({ children }) => (
    <div className="p-6 space-y-4">{children}</div>
  );

  const CardFooter = ({ children }) => (
    <div className="p-6 border-t">{children}</div>
  );

  const Badge = ({ children, className }) => (
    <span className={`text-xs px-2 py-1 rounded-full ${className}`}>
      {children}
    </span>
  );

  const Button = ({ children, className, ...props }) => (
    <button
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        className || "bg-primary text-primary-foreground hover:bg-primary/90"
      }`}
      {...props}
    >
      {children}
    </button>
  );

  const Input = ({ className, ...props }) => (
    <input
      className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        className || ""
      }`}
      {...props}
    />
  );

  const Progress = ({ value }) => (
    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
      <div
        className="h-full bg-primary transition-all duration-300"
        style={{ width: `${value}%` }}
      />
    </div>
  );

  const Select = ({ value, onValueChange, children }) => (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className="flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
    >
      {children}
    </select>
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Investment Learning Hub</h1>
          <p className="text-muted-foreground mt-2">Resources for traders of all experience levels</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </Select>
        </div>
      </div>

      <Tabs>
  <TabsList>
    <TabsTrigger value="ebooks">
      <BookOpen className="h-4 w-4" />
      <span className="hidden sm:inline">eBooks</span>
    </TabsTrigger>
    <TabsTrigger value="videos">
      <Video className="h-4 w-4" />
      <span className="hidden sm:inline">Videos</span>
    </TabsTrigger>
    <TabsTrigger value="articles">
      <FileText className="h-4 w-4" />
      <span className="hidden sm:inline">Articles</span>
    </TabsTrigger>
  </TabsList>

  {/* eBooks Tab */}
  <TabsContent value="ebooks">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filterResources(resources.ebooks).map((book) => (
        <Card key={book.id}>
          <div className="relative h-[160px] w-full bg-muted">
            <Badge className={`absolute top-2 right-2 ${getDifficultyColor(book.difficulty)}`}>
              {book.difficulty}
            </Badge>
            <img 
              src={book.image} 
              alt={book.title}
              className="h-full w-full object-cover" 
            />
          </div>
          <CardHeader>
            <CardTitle>{book.title}</CardTitle>
            <CardDescription>{book.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm mb-2">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {book.duration}
              </div>
              <div>by {book.author}</div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{book.progress}%</span>
              </div>
              <Progress value={book.progress} />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">
              {book.progress > 0 ? "Continue Reading" : "Start Reading"}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  </TabsContent>

  {/* Videos Tab */}
  <TabsContent value="videos">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filterResources(resources.videos).map((video) => (
        <Card key={video.id}>
          <div className="relative h-[160px] w-full bg-muted">
            <Badge className={`absolute top-2 right-2 ${getDifficultyColor(video.difficulty)}`}>
              {video.difficulty}
            </Badge>
            <img 
              src={video.image} 
              alt={video.title}
              className="h-full w-full object-cover" 
            />
            <a 
              href={video.videoUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors">
                <Play className="h-6 w-6 text-white" />
              </div>
            </a>
          </div>
          <CardHeader>
            <CardTitle>{video.title}</CardTitle>
            <CardDescription>{video.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm mb-2">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {video.duration}
              </div>
              <div>by {video.author}</div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{video.progress}%</span>
              </div>
              <Progress value={video.progress} />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">
              {video.progress > 0 ? "Continue Watching" : "Start Watching"}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  </TabsContent>

  {/* Articles Tab */}
  <TabsContent value="articles">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filterResources(resources.articles).map((article) => (
        <Card key={article.id}>
          <div className="relative h-[160px] w-full bg-muted">
            <Badge className={`absolute top-2 right-2 ${getDifficultyColor(article.difficulty)}`}>
              {article.difficulty}
            </Badge>
            <img 
              src={article.image} 
              alt={article.title}
              className="h-full w-full object-cover" 
            />
          </div>
          <CardHeader>
            <CardTitle>{article.title}</CardTitle>
            <CardDescription>{article.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm mb-2">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {article.duration}
              </div>
              <div>by {article.author}</div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{article.progress}%</span>
              </div>
              <Progress value={article.progress} />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">
              {article.progress > 0 ? "Continue Reading" : "Start Reading"}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  </TabsContent>
</Tabs>
    </div>
  );
}