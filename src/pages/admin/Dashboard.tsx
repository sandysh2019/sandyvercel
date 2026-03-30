import { useEffect, useState } from 'react';
import { portfolioAPI, messagesAPI } from '@/lib/api';
import type { Message } from '@/types';
import {
  Briefcase,
  MessageSquare,
  Eye,
  ArrowRight,
  Clock,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProjects: 0,
    graphicDesign: 0,
    webAi: 0,
    totalMessages: 0,
    unreadMessages: 0,
  });
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [portfolio, messages] = await Promise.all([
        portfolioAPI.getAll(),
        messagesAPI.getAll(),
      ]);

      setStats({
        totalProjects: portfolio.length,
        graphicDesign: portfolio.filter((p) => p.category === 'graphic-design').length,
        webAi: portfolio.filter((p) => p.category === 'web-ai').length,
        totalMessages: messages.length,
        unreadMessages: messages.filter((m) => !m.read).length,
      });

      setRecentMessages(messages.slice(0, 5));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Total Projects',
      value: stats.totalProjects,
      icon: Briefcase,
      color: 'bg-gradient-to-br from-primary/30 to-primary/5 text-primary border-primary/20 bg-background/40',
      link: '/admin/portfolio',
      pulse: false,
    },
    {
      label: 'Graphic Design',
      value: stats.graphicDesign,
      icon: Briefcase,
      color: 'bg-gradient-to-br from-fuchsia-500/30 to-fuchsia-500/5 text-fuchsia-500 border-fuchsia-500/20 bg-background/40',
      link: '/admin/portfolio',
      pulse: false,
    },
    {
      label: 'Web/AI Projects',
      value: stats.webAi,
      icon: Activity,
      color: 'bg-gradient-to-br from-emerald-500/30 to-emerald-500/5 text-emerald-500 border-emerald-500/20 bg-background/40',
      link: '/admin/portfolio',
      pulse: false,
    },
    {
      label: 'Unread Messages',
      value: stats.unreadMessages,
      icon: MessageSquare,
      color: 'bg-gradient-to-br from-orange-500/30 to-orange-500/5 text-orange-500 border-orange-500/20 bg-background/40',
      link: '/admin/messages',
      pulse: stats.unreadMessages > 0,
    },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div 
      className="space-y-8 relative"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Background Decorative Blur */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10 dark:bg-primary/10" />

      {/* Header */}
      <motion.div variants={itemVariants} className="border-b border-border/50 pb-6 mb-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-foreground">Command Center</h1>
          <p className="text-muted-foreground font-medium">Overview of your telemetry and system vitals.</p>
        </div>
        <div className="px-4 py-2 rounded-full glass-card border border-border/50 text-xs font-bold text-muted-foreground flex items-center gap-2 shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          SYSTEM ONLINE
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Link
            key={stat.label}
            to={stat.link}
            className="glass-card p-6 transition-all duration-300 group relative overflow-hidden focus:outline-none border border-border/40 hover:border-primary/30"
          >
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent dark:from-white/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1 font-semibold">{stat.label}</p>
                <p className="text-4xl font-extrabold text-foreground group-hover:scale-105 transition-transform origin-left">{stat.value}</p>
              </div>
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner backdrop-blur-md relative ${stat.color}`}
              >
                {stat.pulse && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                  </span>
                )}
                <stat.icon className="w-7 h-7" />
              </div>
            </div>
            <div className="mt-6 flex items-center text-sm text-muted-foreground group-hover:text-primary transition-colors font-bold uppercase tracking-widest text-[10px]">
              <span>Inspect Logs</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Messages */}
        <motion.div variants={itemVariants} className="glass-card lg:col-span-2 flex flex-col h-full border-border/50 hover:border-border transition-colors">
          <div className="p-6 border-b border-border/50 flex items-center justify-between bg-muted/20">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Recent Transmissions
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {stats.unreadMessages} unread protocol messages
              </p>
            </div>
            <Link
              to="/admin/messages"
              className="text-sm font-bold text-primary hover:underline bg-primary/10 px-3 py-1.5 rounded-full"
            >
              View All
            </Link>
          </div>

          <div className="flex-1 bg-background/30">
            {recentMessages.length === 0 ? (
              <div className="h-full min-h-[200px] flex flex-col items-center justify-center p-12 text-center opacity-70">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-muted-foreground font-medium">No messages in queue</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {recentMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-6 hover:bg-muted/30 transition-colors ${
                      !message.read ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-foreground">{message.name}</h3>
                          {!message.read && (
                            <span className="px-2.5 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-bold border border-primary/20">
                              NEW
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{message.email}</p>
                        <p className="text-foreground/80 line-clamp-2 text-sm max-w-2xl leading-relaxed">{message.message}</p>
                      </div>
                      <div className="flex flex-col items-end justify-between self-stretch">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium bg-muted/40 px-2 py-1 rounded-md">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDate(message.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="flex flex-col gap-6">
          <Link
            to="/admin/portfolio/new"
            className="glass-card p-6 flex items-center gap-5 hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-500" />
            <div className="w-14 h-14 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 shadow-inner border border-primary/20">
              <Briefcase className="w-6 h-6" />
            </div>
            <div className="relative z-10 flex-1">
              <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors mb-1">Upload Project</h3>
              <p className="text-sm text-muted-foreground font-medium">Deploy new portfolio asset</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center border border-border/50 group-hover:border-primary/30 transition-colors shadow-sm relative z-10">
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Link>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card p-6 flex items-center gap-5 hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden h-full"
          >
             <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-500" />
            <div className="w-14 h-14 rounded-full bg-muted shadow-inner flex items-center justify-center flex-shrink-0 border border-border/50">
              <Eye className="w-6 h-6 text-foreground" />
            </div>
            <div className="relative z-10 flex-1">
              <h3 className="font-bold text-lg text-foreground mb-1">Preview Live</h3>
              <p className="text-sm text-muted-foreground font-medium">Launch public frontend</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center border border-border/50 transition-colors shadow-sm relative z-10">
              <ArrowRight className="w-4 h-4 text-foreground/50 group-hover:text-foreground transition-colors" />
            </div>
          </a>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
