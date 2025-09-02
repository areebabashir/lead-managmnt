import React, { useState } from 'react';
import { Search, Book, Plus, FileText, Video, HelpCircle } from 'lucide-react';

const mockArticles = [
  { id: 1, title: 'Getting Started with Lead Management', category: 'Basics', views: 1234, type: 'article' },
  { id: 2, title: 'Setting up SMS Campaigns', category: 'Marketing', views: 856, type: 'article' },
  { id: 3, title: 'API Integration Guide', category: 'Technical', views: 642, type: 'article' },
  { id: 4, title: 'Dashboard Overview Video', category: 'Tutorials', views: 1058, type: 'video' },
  { id: 5, title: 'Troubleshooting Common Issues', category: 'Support', views: 923, type: 'article' },
];

const categories = [
  { name: 'Getting Started', count: 12, icon: Book, color: 'blue' },
  { name: 'Lead Management', count: 8, icon: FileText, color: 'green' },
  { name: 'Technical Guides', count: 15, icon: HelpCircle, color: 'purple' },
  { name: 'Video Tutorials', count: 6, icon: Video, color: 'orange' },
];

const Badge = ({ children, variant = "default", className = "" }) => {
  const variantClasses = variant === "secondary" 
    ? "bg-gray-100 text-gray-700" 
    : "bg-blue-100 text-blue-700";
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses} ${className}`}>
      {children}
    </span>
  );
};

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = "" }) => (
  <div className={className}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

type ButtonProps = {
  children: React.ReactNode;
  variant?: "default" | "outline" | string;
  className?: string;
  onClick?: () => void;
};

const Button = ({ children, variant = "default", className = "", onClick }: ButtonProps) => {
  const baseClasses = "inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variantClasses = variant === "outline" 
    ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500"
    : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500";
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

const Input = ({ placeholder, className = "" }) => (
  <input
    type="text"
    placeholder={placeholder}
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${className}`}
  />
);

const AddArticleModal = ({ trigger }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        {trigger}
      </div>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">Add New Article</h2>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Article Title"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Select Category</option>
                <option value="basics">Basics</option>
                <option value="marketing">Marketing</option>
                <option value="technical">Technical</option>
                <option value="tutorials">Tutorials</option>
                <option value="support">Support</option>
              </select>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Content Type</option>
                <option value="article">Article</option>
                <option value="video">Video</option>
              </select>
              <textarea 
                placeholder="Article content..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2 pt-4">
                <Button onClick={() => setIsOpen(false)}>Add Article</Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const getCategoryColor = (color) => {
  const colorMap = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  };
  return colorMap[color] || 'bg-gray-100 text-gray-600';
};

const getCategoryIconColor = (color) => {
  const colorMap = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    purple: 'text-purple-500',
    orange: 'text-orange-500'
  };
  return colorMap[color] || 'text-gray-500';
};

export default function SupportKnowledgeBase() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Knowledge Base</h1>
            <p className="text-gray-600">Find helpful guides and documentation</p>
          </div>
          <AddArticleModal 
            trigger={
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Article
              </Button>
            } 
          />
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search knowledge base..." className="pl-10" />
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((category, index) => (
            <div
              key={category.name}
              className="transform transition-all duration-300 hover:scale-105"
              style={{
                animation: `fadeInUp 0.3s ease-out ${index * 0.1}s both`
              }}
            >
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${getCategoryColor(category.color)}`}>
                      <category.icon className={`h-6 w-6 ${getCategoryIconColor(category.color)}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-600">{category.count} articles</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Popular Articles */}
        <div
          className="transform transition-all duration-300"
          style={{
            animation: 'fadeInUp 0.3s ease-out 0.4s both'
          }}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Popular Articles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockArticles.map((article, index) => (
                <div
                  key={article.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors group"
                  style={{
                    animation: `fadeInUp 0.2s ease-out ${index * 0.05}s both`
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {article.type === 'video' ? (
                        <Video className="h-4 w-4 text-blue-500" />
                      ) : (
                        <FileText className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {article.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{article.category}</Badge>
                        <span className="text-xs text-gray-500">{article.views} views</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}