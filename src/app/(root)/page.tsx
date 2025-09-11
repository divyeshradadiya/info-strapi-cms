import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, Newspaper, Users, TrendingUp, Globe, BookOpen, Star } from "lucide-react";

export default async function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900">
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-white dark:bg-zinc-900">
        <div className="container relative mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 mb-6 text-sm font-medium rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              <Star className="w-4 h-4 mr-2" />
              Trusted by 50,000+ readers worldwide
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-black dark:text-white mb-6">
              Stay Informed with{" "}
              <span className="text-blue-600 dark:text-blue-400">
                Latest News
              </span>{" "}
              & Insights
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Discover breaking news, expert analysis, and thought-provoking articles 
              from around the world. Your trusted source for reliable journalism.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700 text-white" asChild>
                <Link href="/blog">
                  Explore Articles
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800" asChild>
                <Link href="/signup">Start Reading Free</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-zinc-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              We deliver high-quality journalism and expert insights to keep you informed
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Breaking News",
                icon: <Newspaper className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
                desc: "Stay updated with real-time news coverage from trusted sources worldwide"
              },
              {
                title: "Expert Analysis",
                icon: <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
                desc: "In-depth analysis and commentary from industry experts and thought leaders"
              },
              {
                title: "Global Coverage",
                icon: <Globe className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
                desc: "Comprehensive coverage of international events and local stories"
              }
            ].map((feature) => (
              <Card key={feature.title} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-full w-fit">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl text-black dark:text-white">{feature.title}</CardTitle>
                  <CardDescription className="text-base text-gray-600 dark:text-gray-300">
                    {feature.desc}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white dark:bg-zinc-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: <Users className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-2" />, value: "50K+", label: "Active Readers" },
              { icon: <Newspaper className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-2" />, value: "10K+", label: "Articles Published" },
              { icon: <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-2" />, value: "120+", label: "Countries Covered" },
              { icon: <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-2" />, value: "95%", label: "Reader Satisfaction" }
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {stat.icon}
                  <span className="text-3xl md:text-4xl font-bold text-black dark:text-white">{stat.value}</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-20 bg-white dark:bg-zinc-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">
              Explore Categories
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Dive deep into topics that matter to you
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Technology", articles: "1,200+" },
              { name: "Politics", articles: "850+" },
              { name: "Business", articles: "950+" },
              { name: "Science", articles: "720+" },
              { name: "Health", articles: "640+" },
              { name: "Sports", articles: "890+" },
              { name: "Culture", articles: "530+" },
              { name: "Environment", articles: "420+" }
            ].map((category) => (
              <Card key={category.name} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold text-black dark:text-white mb-2">{category.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{category.articles} articles</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 dark:bg-blue-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Stay Informed?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of readers who trust us for reliable news and insightful analysis
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-6 bg-white text-blue-600 hover:bg-gray-100" asChild>
              <Link href="/signup">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 border-white text-black hover:bg-blue-500 dark:border-blue-200 dark:text-blue-200 dark:hover:bg-blue-800"
              asChild
            >
              <Link href="/blog">Browse Articles</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
