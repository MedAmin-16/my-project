import { useState } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { MatrixBackground } from "@/components/matrix-background";
import {
  Search,
  Calendar,
  User,
  Tag,
  ChevronRight,
  Clock,
  ArrowRight,
  FileText
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

// Blog post data
const blogPosts = [
  {
    id: 1,
    title: "Understanding Cross-Site Scripting (XSS) in Modern Web Applications",
    excerpt: "Cross-Site Scripting remains one of the most common web vulnerabilities. Learn about the different types of XSS attacks, detection methods, and prevention strategies for modern web frameworks.",
    image: "/xss-image.jpg",
    author: "Sophia Rodriguez",
    authorRole: "Chief Security Officer",
    date: "March 25, 2025",
    readTime: "8 min read",
    category: "Web Security",
    tags: ["XSS", "Web Security", "JavaScript", "Prevention"]
  },
  {
    id: 2,
    title: "The Rise of API Security Vulnerabilities: What You Need to Know",
    excerpt: "As organizations increasingly rely on APIs, new security challenges emerge. This post examines common API vulnerabilities, real-world examples, and best practices for secure API development.",
    image: "/api-security.jpg",
    author: "Marcus Washington",
    authorRole: "Chief Technology Officer",
    date: "March 18, 2025",
    readTime: "10 min read",
    category: "API Security",
    tags: ["API", "REST", "GraphQL", "OAuth"]
  },
  {
    id: 3,
    title: "Server-Side Request Forgery (SSRF): The Hidden Threat",
    excerpt: "SSRF vulnerabilities can lead to devastating data breaches. We break down how these attacks work, why they're so dangerous in cloud environments, and how to protect your applications.",
    image: "/ssrf-attacks.jpg",
    author: "David Kim",
    authorRole: "VP of Engineering",
    date: "March 12, 2025",
    readTime: "12 min read",
    category: "Network Security",
    tags: ["SSRF", "Cloud Security", "AWS", "Infrastructure"]
  },
  {
    id: 4,
    title: "Building a Career in Bug Bounty Hunting: From Beginner to Professional",
    excerpt: "Want to turn bug hunting into a full-time career? This comprehensive guide covers the skills you need, how to build your reputation, manage finances, and succeed in the competitive world of bug bounties.",
    image: "/career-guide.jpg",
    author: "Priya Patel",
    authorRole: "Head of Community",
    date: "March 8, 2025",
    readTime: "15 min read",
    category: "Career",
    tags: ["Career", "Bug Bounty", "Freelancing", "Skills Development"]
  },
  {
    id: 5,
    title: "Mobile App Security Testing: A Practical Approach",
    excerpt: "Mobile applications present unique security challenges. Learn practical techniques for testing both Android and iOS apps, including code analysis, runtime manipulation, and identifying common mobile vulnerabilities.",
    image: "/mobile-security.jpg",
    author: "Alex Chen",
    authorRole: "Mobile Security Researcher",
    date: "March 3, 2025",
    readTime: "11 min read",
    category: "Mobile Security",
    tags: ["Android", "iOS", "OWASP Mobile", "Dynamic Analysis"]
  },
  {
    id: 6,
    title: "Responsible Disclosure: Ethics and Best Practices",
    excerpt: "Navigating the sometimes complex waters of vulnerability disclosure requires understanding both technical and ethical considerations. This guide outlines the principles of responsible disclosure and how to handle difficult situations.",
    image: "/disclosure-ethics.jpg",
    author: "James Wilson",
    authorRole: "VP of Business Development",
    date: "February 25, 2025",
    readTime: "9 min read",
    category: "Ethics",
    tags: ["Disclosure", "Ethics", "Legal", "Communication"]
  }
];

// Featured post data
const featuredPost = {
  id: 7,
  title: "The Future of Bug Bounty Programs: Trends and Predictions for 2026",
  excerpt: "As cybersecurity threats evolve, so do the methods for finding and fixing vulnerabilities. This in-depth analysis explores emerging trends in bug bounty programs, from AI-assisted vulnerability discovery to new reward models and specialized programs for critical infrastructure.",
  image: "/future-trends.jpg",
  author: "Alexandra Chen",
  authorRole: "Chief Executive Officer",
  date: "March 28, 2025",
  readTime: "14 min read",
  category: "Industry Insights",
  tags: ["Future Trends", "AI", "Automation", "Industry Analysis"]
};

// Categories
const categories = [
  "All Posts",
  "Web Security",
  "API Security",
  "Mobile Security",
  "Network Security",
  "Cloud Security",
  "Career",
  "Industry Insights",
  "Tools & Resources",
  "Case Studies"
];

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Posts");
  
  // Filter posts based on search query and active category
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = searchQuery === "" || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = activeCategory === "All Posts" || post.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  return (
    <div className="min-h-screen bg-deep-black relative">
      <MatrixBackground className="opacity-20" />
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 py-12 relative z-10">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-mono font-bold text-matrix mb-4">CyberHunt Blog</h1>
          <p className="text-dim-gray mb-6 max-w-3xl mx-auto">
            Insights, tutorials, and news from the world of cybersecurity and bug bounty hunting.
            Stay updated with the latest vulnerability trends, research, and community stories.
          </p>
          
          <div className="max-w-xl mx-auto relative">
            <Input
              type="text"
              placeholder="Search articles..."
              className="bg-dark-terminal border-matrix/30 pl-10 h-12 font-mono"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-3.5 h-5 w-5 text-dim-gray pointer-events-none" />
          </div>
        </div>
        
        {/* Featured Article */}
        <div className="mb-12">
          <div className="terminal-card overflow-hidden rounded-lg border border-matrix/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              <div className="p-8">
                <div className="flex items-center space-x-2 text-xs font-mono mb-3">
                  <span className="px-2 py-1 bg-matrix/20 rounded text-matrix">{featuredPost.category}</span>
                  <span className="text-dim-gray">•</span>
                  <span className="text-dim-gray flex items-center">
                    <Clock className="h-3 w-3 mr-1" /> {featuredPost.readTime}
                  </span>
                </div>
                
                <h2 className="text-2xl font-mono font-bold text-matrix mb-4">
                  {featuredPost.title}
                </h2>
                
                <p className="text-dim-gray mb-6 line-clamp-3">
                  {featuredPost.excerpt}
                </p>
                
                <div className="flex items-center mb-6">
                  <div className="h-10 w-10 rounded-full bg-matrix/20 flex items-center justify-center border border-matrix/30 mr-3">
                    <User className="h-5 w-5 text-matrix" />
                  </div>
                  <div>
                    <p className="text-light-gray text-sm font-mono">{featuredPost.author}</p>
                    <p className="text-dim-gray text-xs">{featuredPost.authorRole}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 text-xs text-dim-gray mb-6">
                  <div className="flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    <span>{featuredPost.date}</span>
                  </div>
                </div>
                
                <Button variant="outline" className="border-matrix text-matrix hover:bg-matrix/10">
                  Read Full Article
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              
              <div className="bg-terminal/50 flex items-center justify-center p-6">
                <div className="relative w-full h-64 flex items-center justify-center">
                  <div className="absolute inset-10 bg-matrix/10 blur-xl rounded-full"></div>
                  <div className="relative z-10 text-matrix text-center">
                    <FileText className="h-16 w-16 mx-auto mb-4 text-matrix" />
                    <h3 className="text-xl font-mono">Featured Article</h3>
                    <p className="text-dim-gray text-sm max-w-xs mx-auto mt-2">
                      Our CEO's analysis of future bug bounty trends
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Categories */}
        <div className="mb-8 overflow-x-auto">
          <Tabs value={activeCategory} className="w-full">
            <TabsList className="flex space-x-2 bg-transparent h-auto p-0 mb-6 overflow-x-auto">
              {categories.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  onClick={() => setActiveCategory(category)}
                  className="flex-shrink-0 text-xs md:text-sm bg-terminal border border-matrix/30 data-[state=active]:bg-matrix/10 data-[state=active]:border-matrix data-[state=active]:text-matrix text-dim-gray rounded-md py-2 px-3 whitespace-nowrap"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        
        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredPosts.map((post) => (
            <div key={post.id} className="terminal-card rounded-lg border border-matrix/30 overflow-hidden hover:bg-matrix/5 transition duration-200">
              <div className="h-48 bg-terminal/50 flex items-center justify-center">
                <div className="bg-matrix/10 w-16 h-16 rounded-full flex items-center justify-center blur-xl absolute"></div>
                <div className="relative z-10 text-matrix text-center p-6">
                  <Tag className="h-10 w-10 mx-auto mb-2" />
                  <span className="text-sm font-mono">{post.category}</span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between text-xs text-dim-gray mb-3">
                  <div className="flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    <span>{post.date}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
                
                <h3 className="text-xl font-mono font-bold text-light-gray hover:text-matrix mb-3">
                  <Link href={`/blog/${post.id}`}>
                    <div className="cursor-pointer">{post.title}</div>
                  </Link>
                </h3>
                
                <p className="text-dim-gray mb-4 text-sm line-clamp-3">
                  {post.excerpt}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag, index) => (
                    <span key={index} className="text-xs px-2 py-0.5 bg-matrix/10 text-matrix rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-matrix/20 flex items-center justify-center border border-matrix/30 mr-2">
                    <User className="h-4 w-4 text-matrix" />
                  </div>
                  <div>
                    <p className="text-light-gray text-xs font-mono">{post.author}</p>
                    <p className="text-dim-gray text-xs">{post.authorRole}</p>
                  </div>
                </div>
              </div>
              
              <div className="px-6 pb-6">
                <Link href={`/blog/${post.id}`}>
                  <div className="text-matrix hover:text-matrix-dark text-sm font-mono flex items-center cursor-pointer">
                    Read More <ChevronRight className="ml-1 h-4 w-4" />
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        {/* Newsletter Subscription */}
        <div className="terminal-card p-8 rounded-lg text-center mb-12">
          <h2 className="text-2xl font-mono font-bold text-matrix mb-3">Stay Updated</h2>
          <p className="text-dim-gray mb-6 max-w-xl mx-auto">
            Subscribe to our newsletter to receive the latest articles, security advisories, 
            and community updates directly in your inbox.
          </p>
          
          <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-4">
            <Input
              type="email"
              placeholder="Enter your email address"
              className="bg-dark-terminal border-matrix/30 font-mono flex-grow"
            />
            <Button className="bg-matrix text-black hover:bg-matrix/80 font-mono whitespace-nowrap">
              Subscribe
            </Button>
          </div>
          
          <p className="text-xs text-dim-gray mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
        
        {/* Recent Articles */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-mono font-bold text-matrix">Recent Articles</h2>
            <Link href="/blog/archive">
              <div className="text-matrix hover:text-matrix-dark text-sm font-mono flex items-center cursor-pointer">
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </div>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {blogPosts.slice(0, 4).map((post) => (
              <div key={post.id} className="terminal-card p-4 rounded-lg border border-matrix/30 hover:bg-matrix/5 transition duration-200">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-16 h-16 bg-terminal/50 rounded-md border border-matrix/30 flex items-center justify-center mr-4">
                    <Tag className="h-6 w-6 text-matrix" />
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex items-center space-x-3 text-xs text-dim-gray mb-1">
                      <span className="text-matrix">{post.category}</span>
                      <span>•</span>
                      <span>{post.date}</span>
                      <span>•</span>
                      <span>{post.readTime}</span>
                    </div>
                    
                    <Link href={`/blog/${post.id}`}>
                      <div className="text-light-gray hover:text-matrix font-mono text-lg mb-1 block cursor-pointer">
                        {post.title}
                      </div>
                    </Link>
                    
                    <p className="text-dim-gray text-sm line-clamp-1">
                      {post.excerpt}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}