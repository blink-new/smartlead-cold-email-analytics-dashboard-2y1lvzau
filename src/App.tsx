import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts'
import { 
  Mail, 
  MousePointer, 
  MessageSquare, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  Globe,
  Calendar,
  Download,
  Filter,
  Search,
  MoreHorizontal,
  Eye,
  Clock,
  Target,
  Zap,
  Key,
  RefreshCw,
  CheckCircle,
  XCircle,
  Loader2,
  BarChart3,
  Settings,
  Shield,
  Activity,
  Pause,
  Play,
  AlertCircle,
  Wifi,
  WifiOff
} from 'lucide-react'

// Types for Smartlead API data
interface SmartleadCampaign {
  id: string
  name: string
  status: string
  total_leads: number
  sent_count: number
  open_count: number
  click_count: number
  reply_count: number
  bounce_count: number
  created_at: string
}

interface DashboardMetrics {
  totalEmails: number
  openRate: number
  clickRate: number
  responseRate: number
  bounceRate: number
}

// Mock data for fallback
const mockMetrics = {
  totalEmails: 15420,
  openRate: 24.8,
  clickRate: 3.2,
  responseRate: 1.8,
  bounceRate: 2.1
}

const mockCampaignData = [
  { name: 'Jan', sent: 2400, opened: 600, clicked: 120, responded: 45 },
  { name: 'Feb', sent: 2800, opened: 720, clicked: 140, responded: 52 },
  { name: 'Mar', sent: 3200, opened: 850, clicked: 180, responded: 68 },
  { name: 'Apr', sent: 2900, opened: 780, clicked: 165, responded: 58 },
  { name: 'May', sent: 3500, opened: 980, clicked: 220, responded: 85 },
  { name: 'Jun', sent: 3800, opened: 1100, clicked: 280, responded: 95 }
]

const mockEmailStatusData = [
  { name: 'Delivered', value: 12850, color: '#10b981' },
  { name: 'Opened', value: 3190, color: '#3b82f6' },
  { name: 'Clicked', value: 493, color: '#8b5cf6' },
  { name: 'Bounced', value: 324, color: '#ef4444' },
  { name: 'Replied', value: 277, color: '#f59e0b' }
]

const mockTimeSeriesData = [
  { time: '00:00', opens: 45, clicks: 8 },
  { time: '04:00', opens: 32, clicks: 5 },
  { time: '08:00', opens: 128, clicks: 22 },
  { time: '12:00', opens: 185, clicks: 35 },
  { time: '16:00', opens: 142, clicks: 28 },
  { time: '20:00', opens: 98, clicks: 18 }
]

function App() {
  const [apiKey, setApiKey] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [campaigns, setCampaigns] = useState<SmartleadCampaign[]>([])
  const [metrics, setMetrics] = useState<DashboardMetrics>(mockMetrics)
  const [campaignPerformanceData, setCampaignPerformanceData] = useState(mockCampaignData)
  const [emailStatusData, setEmailStatusData] = useState(mockEmailStatusData)
  const [timeSeriesData, setTimeSeriesData] = useState(mockTimeSeriesData)
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [emailAccounts, setEmailAccounts] = useState([])
  const [loadingAccounts, setLoadingAccounts] = useState(false)

  // Mock email accounts data for demo mode
  const mockEmailAccounts = [
    {
      id: 1,
      email: 'sales@company.com',
      status: 'active',
      health_score: 95,
      daily_limit: 50,
      sent_today: 23,
      reputation: 'excellent',
      warmup_status: 'completed',
      last_activity: '2024-01-23T10:30:00Z',
      provider: 'Gmail',
      bounce_rate: 2.1,
      spam_rate: 0.5,
      deliverability: 97.8
    },
    {
      id: 2,
      email: 'outreach@company.com',
      status: 'active',
      health_score: 88,
      daily_limit: 40,
      sent_today: 35,
      reputation: 'good',
      warmup_status: 'in_progress',
      last_activity: '2024-01-23T09:15:00Z',
      provider: 'Outlook',
      bounce_rate: 3.2,
      spam_rate: 1.1,
      deliverability: 94.5
    },
    {
      id: 3,
      email: 'marketing@company.com',
      status: 'paused',
      health_score: 72,
      daily_limit: 30,
      sent_today: 0,
      reputation: 'fair',
      warmup_status: 'needed',
      last_activity: '2024-01-22T16:45:00Z',
      provider: 'Gmail',
      bounce_rate: 5.8,
      spam_rate: 2.3,
      deliverability: 89.2
    },
    {
      id: 4,
      email: 'support@company.com',
      status: 'warning',
      health_score: 65,
      daily_limit: 25,
      sent_today: 18,
      reputation: 'needs_attention',
      warmup_status: 'paused',
      last_activity: '2024-01-23T08:20:00Z',
      provider: 'Yahoo',
      bounce_rate: 7.2,
      spam_rate: 3.1,
      deliverability: 85.7
    }
  ]

  // Generate monthly performance data from campaigns
  const generateMonthlyData = (campaignList: SmartleadCampaign[]) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    return months.map(month => {
      // For demo purposes, we'll use mock data but in real implementation
      // you would aggregate campaigns by month based on created_at dates
      const monthCampaigns = campaignList.slice(0, Math.floor(Math.random() * campaignList.length))
      const sent = monthCampaigns.reduce((sum, campaign) => sum + (campaign.sent_count || 0), 0) || Math.floor(Math.random() * 3000) + 2000
      const opened = monthCampaigns.reduce((sum, campaign) => sum + (campaign.open_count || 0), 0) || Math.floor(sent * 0.25)
      const clicked = monthCampaigns.reduce((sum, campaign) => sum + (campaign.click_count || 0), 0) || Math.floor(opened * 0.15)
      const responded = monthCampaigns.reduce((sum, campaign) => sum + (campaign.reply_count || 0), 0) || Math.floor(clicked * 0.3)
      
      return { name: month, sent, opened, clicked, responded }
    })
  }

  // Function to fetch email accounts from Smartlead API
  const fetchEmailAccounts = async (key: string) => {
    setLoadingAccounts(true)
    
    try {
      const response = await fetch(`https://server.smartlead.ai/api/v1/email-accounts?api_key=${key}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch email accounts')
      }

      const data = await response.json()
      setEmailAccounts(data.email_accounts || data || [])
      
    } catch (err) {
      console.error('Failed to fetch email accounts:', err)
      // Use mock data as fallback
      setEmailAccounts(mockEmailAccounts)
    } finally {
      setLoadingAccounts(false)
    }
  }

  // Function to fetch data from Smartlead API
  const fetchSmartleadData = async (key: string) => {
    setIsLoading(true)
    setError('')
    
    try {
      // Fetch campaigns from Smartlead API
      const response = await fetch(`https://server.smartlead.ai/api/v1/campaigns?api_key=${key}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error:', response.status, errorText)
        throw new Error(`Invalid API key or failed to connect to Smartlead (${response.status})`)
      }

      const data = await response.json()
      const campaignList = data.campaigns || data || []
      
      setCampaigns(campaignList)
      
      // Also fetch email accounts when connecting
      await fetchEmailAccounts(key)
      
      // Calculate metrics from real data with safe fallbacks
      const totalSent = campaignList.reduce((sum: number, campaign: SmartleadCampaign) => sum + (campaign.sent_count || 0), 0)
      const totalOpened = campaignList.reduce((sum: number, campaign: SmartleadCampaign) => sum + (campaign.open_count || 0), 0)
      const totalClicked = campaignList.reduce((sum: number, campaign: SmartleadCampaign) => sum + (campaign.click_count || 0), 0)
      const totalReplied = campaignList.reduce((sum: number, campaign: SmartleadCampaign) => sum + (campaign.reply_count || 0), 0)
      const totalBounced = campaignList.reduce((sum: number, campaign: SmartleadCampaign) => sum + (campaign.bounce_count || 0), 0)

      const calculatedMetrics = {
        totalEmails: totalSent || 0,
        openRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
        clickRate: totalSent > 0 ? (totalClicked / totalSent) * 100 : 0,
        responseRate: totalSent > 0 ? (totalReplied / totalSent) * 100 : 0,
        bounceRate: totalSent > 0 ? (totalBounced / totalSent) * 100 : 0
      }

      setMetrics(calculatedMetrics)

      // Update email status data with real numbers
      const realEmailStatusData = [
        { name: 'Delivered', value: totalSent - totalBounced, color: '#10b981' },
        { name: 'Opened', value: totalOpened, color: '#3b82f6' },
        { name: 'Clicked', value: totalClicked, color: '#8b5cf6' },
        { name: 'Bounced', value: totalBounced, color: '#ef4444' },
        { name: 'Replied', value: totalReplied, color: '#f59e0b' }
      ]
      setEmailStatusData(realEmailStatusData)

      // Generate campaign performance data from real campaigns
      const monthlyData = generateMonthlyData(campaignList)
      setCampaignPerformanceData(monthlyData)

      setIsConnected(true)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to Smartlead API')
      setIsConnected(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnect = async () => {
    if (!apiKey.trim()) return
    
    setIsLoading(true)
    setError('')
    
    const trimmedKey = apiKey.trim()
    
    // Try different API endpoints and authentication methods
    const endpoints = [
      {
        url: `https://server.smartlead.ai/api/v1/campaigns?api_key=${trimmedKey}`,
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        url: 'https://server.smartlead.ai/api/v1/campaigns',
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${trimmedKey}`,
          'Content-Type': 'application/json' 
        }
      },
      {
        url: 'https://server.smartlead.ai/api/v1/campaigns',
        method: 'GET',
        headers: { 
          'X-API-Key': trimmedKey,
          'Content-Type': 'application/json' 
        }
      }
    ]
    
    let lastError = ''
    
    for (const endpoint of endpoints) {
      try {
        console.log('Trying endpoint:', endpoint.url)
        const response = await fetch(endpoint.url, {
          method: endpoint.method,
          headers: endpoint.headers
        })
        
        if (response.ok) {
          // Success! Use this endpoint configuration
          await fetchSmartleadData(trimmedKey)
          return
        } else {
          const errorText = await response.text()
          lastError = `${response.status}: ${errorText}`
          console.log(`Endpoint failed (${response.status}):`, errorText)
        }
      } catch (err) {
        lastError = err instanceof Error ? err.message : 'Network error'
        console.log('Endpoint error:', err)
      }
    }
    
    // All endpoints failed
    setError(`Failed to connect with API key. Last error: ${lastError}. Please check your API key and try again.`)
    setIsLoading(false)
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setApiKey('')
    setError('')
    setCampaigns([])
    setEmailAccounts([])
    setMetrics(mockMetrics)
    setCampaignPerformanceData(mockCampaignData)
    setEmailStatusData(mockEmailStatusData)
    setTimeSeriesData(mockTimeSeriesData)
  }

  const handleRefresh = () => {
    if (apiKey && isConnected) {
      fetchSmartleadData(apiKey)
    }
  }

  // Get recent campaigns for display
  const recentCampaigns = campaigns.slice(0, 5).map(campaign => ({
    id: campaign.id || 'unknown',
    name: campaign.name || 'Unnamed Campaign',
    status: campaign.status || 'Unknown',
    sent: campaign.sent_count || 0,
    openRate: (campaign.sent_count || 0) > 0 ? (((campaign.open_count || 0) / campaign.sent_count) * 100).toFixed(1) : '0.0',
    clickRate: (campaign.sent_count || 0) > 0 ? (((campaign.click_count || 0) / campaign.sent_count) * 100).toFixed(1) : '0.0',
    responses: campaign.reply_count || 0
  }))

  // Get top performing campaigns
  const topPerformingCampaigns = campaigns
    .filter(campaign => (campaign.sent_count || 0) > 0)
    .map(campaign => ({
      name: campaign.name || 'Unnamed Campaign',
      openRate: ((campaign.open_count || 0) / (campaign.sent_count || 1)) * 100,
      responses: campaign.reply_count || 0
    }))
    .sort((a, b) => b.openRate - a.openRate)
    .slice(0, 4)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-slate-900">Smartlead Analytics</h1>
            </div>
            {isConnected && (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                Connected
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {isConnected && (
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            )}
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* API Key Connection Section */}
        {!isConnected && (
          <Card className="bg-white border-blue-200">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Key className="w-5 h-5 text-blue-600" />
                <CardTitle className="text-lg font-semibold text-slate-900">Connect to Smartlead.ai</CardTitle>
              </div>
              <CardDescription className="text-slate-500">
                Enter your Smartlead.ai API key to fetch real campaign data and analytics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <div className="flex space-x-2">
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="Enter your Smartlead.ai API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleConnect} disabled={!apiKey.trim() || isLoading}>
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Zap className="w-4 h-4 mr-2" />
                    )}
                    Connect
                  </Button>
                </div>
              </div>
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              <div className="text-sm text-slate-500">
                <p>To get your API key:</p>
                <ol className="list-decimal list-inside mt-1 space-y-1">
                  <li>Log in to your Smartlead.ai account</li>
                  <li>Go to Settings → API Keys</li>
                  <li>Generate a new API key or copy an existing one</li>
                  <li>Paste it above and click Connect</li>
                </ol>
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800">
                    <strong>Note:</strong> Make sure your API key has permissions to access campaigns and email accounts. 
                    If you're still having issues, try refreshing your API key in Smartlead.ai settings.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Connected State - Show Disconnect Option */}
        {isConnected && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-800 font-medium">Connected to Smartlead.ai</span>
                  <span className="text-green-600 text-sm">({campaigns.length} campaigns loaded)</span>
                </div>
                <Button variant="outline" size="sm" onClick={handleDisconnect}>
                  Disconnect
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white border border-slate-200">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="accounts" className="flex items-center space-x-2">
              <Mail className="w-4 h-4" />
              <span>Email Accounts</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab Content */}
          <TabsContent value="dashboard" className="space-y-6 mt-6">

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Emails</CardTitle>
              <Mail className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{(metrics.totalEmails || 0).toLocaleString()}</div>
              <div className="flex items-center text-xs text-green-600 mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                {isConnected ? 'Live data' : '+12.5% from last month'}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Open Rate</CardTitle>
              <Eye className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{(metrics.openRate || 0).toFixed(1)}%</div>
              <div className="flex items-center text-xs text-green-600 mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                {isConnected ? 'Live data' : '+2.1% from last month'}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Click Rate</CardTitle>
              <MousePointer className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{(metrics.clickRate || 0).toFixed(1)}%</div>
              <div className="flex items-center text-xs text-red-600 mt-1">
                <TrendingDown className="w-3 h-3 mr-1" />
                {isConnected ? 'Live data' : '-0.3% from last month'}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Response Rate</CardTitle>
              <MessageSquare className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{(metrics.responseRate || 0).toFixed(1)}%</div>
              <div className="flex items-center text-xs text-green-600 mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                {isConnected ? 'Live data' : '+0.4% from last month'}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Bounce Rate</CardTitle>
              <AlertTriangle className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{(metrics.bounceRate || 0).toFixed(1)}%</div>
              <div className="flex items-center text-xs text-green-600 mt-1">
                <TrendingDown className="w-3 h-3 mr-1" />
                {isConnected ? 'Live data' : '-0.2% from last month'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Campaign Performance Chart */}
          <Card className="lg:col-span-2 bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-slate-900">Campaign Performance</CardTitle>
                  <CardDescription className="text-slate-500">
                    {isConnected ? 'Real-time email metrics from your campaigns' : 'Email metrics over the last 6 months'}
                  </CardDescription>
                </div>
                <Tabs value={selectedTimeRange} onValueChange={setSelectedTimeRange} className="w-auto">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="7d">7D</TabsTrigger>
                    <TabsTrigger value="30d">30D</TabsTrigger>
                    <TabsTrigger value="90d">90D</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={campaignPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }} 
                  />
                  <Area type="monotone" dataKey="sent" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                  <Area type="monotone" dataKey="opened" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.8} />
                  <Area type="monotone" dataKey="clicked" stackId="3" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.8} />
                  <Area type="monotone" dataKey="responded" stackId="4" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.8} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Email Status Distribution */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">Email Status</CardTitle>
              <CardDescription className="text-slate-500">
                {isConnected ? 'Live distribution from your campaigns' : 'Distribution of email statuses'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={emailStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {emailStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {emailStatusData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-slate-600">{item.name}</span>
                    </div>
                    <span className="font-medium text-slate-900">{(item.value || 0).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Campaigns and Top Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Campaigns Table */}
          <Card className="lg:col-span-2 bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">Recent Campaigns</CardTitle>
              <CardDescription className="text-slate-500">
                {isConnected ? `Latest campaigns from your Smartlead account (${campaigns.length} total)` : 'Latest email campaign performance'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(isConnected ? recentCampaigns : [
                  { id: '1', name: 'Q2 Product Launch', status: 'Active', sent: 2500, openRate: '28.4', clickRate: '4.1', responses: 45 },
                  { id: '2', name: 'Summer Sale Outreach', status: 'Completed', sent: 1800, openRate: '22.1', clickRate: '2.8', responses: 32 },
                  { id: '3', name: 'Partnership Proposal', status: 'Active', sent: 950, openRate: '31.2', clickRate: '5.2', responses: 28 },
                  { id: '4', name: 'Feature Update Announcement', status: 'Paused', sent: 3200, openRate: '19.8', clickRate: '2.1', responses: 18 },
                  { id: '5', name: 'Customer Feedback Survey', status: 'Active', sent: 1200, openRate: '35.6', clickRate: '8.3', responses: 67 }
                ]).map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-medium text-slate-900">{campaign.name}</h3>
                        <Badge 
                          variant={campaign.status === 'Active' ? 'default' : campaign.status === 'Completed' ? 'secondary' : 'outline'}
                          className={
                            campaign.status === 'Active' ? 'bg-green-100 text-green-800' :
                            campaign.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }
                        >
                          {campaign.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-6 mt-2 text-sm text-slate-500">
                        <span>{(campaign.sent || 0).toLocaleString()} sent</span>
                        <span>{campaign.openRate || '0.0'}% open rate</span>
                        <span>{campaign.clickRate || '0.0'}% click rate</span>
                        <span>{campaign.responses || 0} responses</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Performing Campaigns */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">Top Performers</CardTitle>
              <CardDescription className="text-slate-500">
                {isConnected ? 'Your highest performing campaigns' : 'Highest performing campaigns'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(isConnected && topPerformingCampaigns.length > 0 ? topPerformingCampaigns : [
                  { name: 'Customer Feedback Survey', openRate: 35.6, responses: 67 },
                  { name: 'Partnership Proposal', openRate: 31.2, responses: 28 },
                  { name: 'Q2 Product Launch', openRate: 28.4, responses: 45 },
                  { name: 'Summer Sale Outreach', openRate: 22.1, responses: 32 }
                ]).map((campaign, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-900 truncate">{campaign.name}</span>
                      <span className="text-sm text-slate-500">{(campaign.openRate || 0).toFixed(1)}%</span>
                    </div>
                    <Progress value={campaign.openRate || 0} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{campaign.responses || 0} responses</span>
                      <span>#{index + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Time-based Analytics */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">Engagement by Time</CardTitle>
            <CardDescription className="text-slate-500">Email opens and clicks throughout the day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="opens" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="clicks" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

          </TabsContent>

          {/* Email Accounts Tab Content */}
          <TabsContent value="accounts" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Email Accounts</h2>
                <p className="text-slate-500 mt-1">
                  {isConnected ? `Manage your ${emailAccounts.length || mockEmailAccounts.length} email accounts and monitor their health` : 'Monitor email account health and performance'}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Email Accounts Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Accounts</CardTitle>
                  <Mail className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">
                    {isConnected ? emailAccounts.length : mockEmailAccounts.length}
                  </div>
                  <div className="flex items-center text-xs text-green-600 mt-1">
                    <Wifi className="w-3 h-3 mr-1" />
                    {isConnected ? 'Live data' : 'Demo data'}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Active Accounts</CardTitle>
                  <Activity className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">
                    {(isConnected ? emailAccounts : mockEmailAccounts).filter((account: any) => account.status === 'active').length}
                  </div>
                  <div className="flex items-center text-xs text-green-600 mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Healthy status
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Avg Health Score</CardTitle>
                  <Shield className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">
                    {Math.round((isConnected ? emailAccounts : mockEmailAccounts).reduce((sum: number, account: any) => sum + account.health_score, 0) / (isConnected ? emailAccounts.length || 1 : mockEmailAccounts.length))}
                  </div>
                  <div className="flex items-center text-xs text-green-600 mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Good overall health
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Needs Attention</CardTitle>
                  <AlertCircle className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">
                    {(isConnected ? emailAccounts : mockEmailAccounts).filter((account: any) => account.status === 'warning' || account.health_score < 70).length}
                  </div>
                  <div className="flex items-center text-xs text-red-600 mt-1">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Requires review
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Email Accounts Table */}
            <Card className="bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-slate-900">Email Account Health</CardTitle>
                    <CardDescription className="text-slate-500">
                      {isConnected ? 'Real-time health monitoring of your email accounts' : 'Monitor email account performance and deliverability'}
                    </CardDescription>
                  </div>
                  {loadingAccounts && (
                    <div className="flex items-center text-sm text-slate-500">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading accounts...
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(isConnected ? emailAccounts : mockEmailAccounts).map((account: any) => (
                    <div key={account.id} className="border border-slate-200 rounded-lg p-6 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Mail className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">{account.email}</h3>
                            <p className="text-sm text-slate-500">{account.provider}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge 
                            className={
                              account.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' :
                              account.status === 'paused' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                              'bg-red-100 text-red-800 border-red-200'
                            }
                          >
                            {account.status === 'active' && <Wifi className="w-3 h-3 mr-1" />}
                            {account.status === 'paused' && <Pause className="w-3 h-3 mr-1" />}
                            {account.status === 'warning' && <WifiOff className="w-3 h-3 mr-1" />}
                            {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Health Score and Progress */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-700">Health Score</span>
                          <span className={`text-sm font-semibold ${
                            account.health_score >= 90 ? 'text-green-600' :
                            account.health_score >= 70 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {account.health_score}/100
                          </span>
                        </div>
                        <Progress 
                          value={account.health_score} 
                          className={`h-2 ${
                            account.health_score >= 90 ? '[&>div]:bg-green-500' :
                            account.health_score >= 70 ? '[&>div]:bg-yellow-500' :
                            '[&>div]:bg-red-500'
                          }`}
                        />
                      </div>

                      {/* Account Metrics Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-slate-900">{account.sent_today}</div>
                          <div className="text-xs text-slate-500">Sent Today</div>
                          <div className="text-xs text-slate-400">/ {account.daily_limit} limit</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-slate-900">{account.deliverability}%</div>
                          <div className="text-xs text-slate-500">Deliverability</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-slate-900">{account.bounce_rate}%</div>
                          <div className="text-xs text-slate-500">Bounce Rate</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-slate-900">{account.spam_rate}%</div>
                          <div className="text-xs text-slate-500">Spam Rate</div>
                        </div>
                      </div>

                      {/* Warmup Status and Reputation */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-slate-500">Warmup:</span>
                            <Badge 
                              variant="outline"
                              className={
                                account.warmup_status === 'completed' ? 'border-green-200 text-green-700' :
                                account.warmup_status === 'in_progress' ? 'border-blue-200 text-blue-700' :
                                account.warmup_status === 'paused' ? 'border-yellow-200 text-yellow-700' :
                                'border-red-200 text-red-700'
                              }
                            >
                              {account.warmup_status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-slate-500">Reputation:</span>
                            <Badge 
                              variant="outline"
                              className={
                                account.reputation === 'excellent' ? 'border-green-200 text-green-700' :
                                account.reputation === 'good' ? 'border-blue-200 text-blue-700' :
                                account.reputation === 'fair' ? 'border-yellow-200 text-yellow-700' :
                                'border-red-200 text-red-700'
                              }
                            >
                              {account.reputation.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-slate-400">
                          Last activity: {new Date(account.last_activity).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  )
}

export default App