import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Plus, 
  Calendar, 
  Users, 
  FileText, 
  Clock, 
  Tag, 
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Download,
  RefreshCw,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  Folder,
  User,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { meetingNotesAPI, MeetingNote, MeetingNotesListParams } from '@/services/meetingNotesAPI';
import { MeetingNoteDetailModal } from '@/components/meetingNotes/MeetingNoteDetailModal';
import { EditMeetingNoteModal } from '@/components/meetingNotes/EditMeetingNoteModal';
import { DeleteConfirmationModal } from '@/components/meetingNotes/DeleteConfirmationModal';
import { useAuth } from '../../contexts/AuthContext';

const MeetingNotesManager: React.FC = () => {
  // Data state
  const [meetingNotes, setMeetingNotes] = useState<MeetingNote[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // UI state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedNote, setSelectedNote] = useState<MeetingNote | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [sortBy, setSortBy] = useState<'meetingDate' | 'createdAt' | 'meetingTitle'>('meetingDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 12;

  const { hasPermission } = useAuth();

  useEffect(() => {
    fetchMeetingNotes();
    fetchStats();
  }, [currentPage, searchQuery, categoryFilter, tagFilter, dateFilter, sortBy, sortOrder]);

  const fetchMeetingNotes = async () => {
    try {
      setLoading(true);
      
      const params: MeetingNotesListParams = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery || undefined,
        category: categoryFilter || undefined,
        tags: tagFilter || undefined,
        sortBy,
        sortOrder
      };

      // Add date filter
      if (dateFilter) {
        const now = new Date();
        switch (dateFilter) {
          case 'today':
            params.dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
            params.dateTo = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            params.dateFrom = weekAgo.toISOString();
            break;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            params.dateFrom = monthAgo.toISOString();
            break;
        }
      }

      const response = await meetingNotesAPI.getMeetingNotes(params);
      
      if (response.success) {
        setMeetingNotes(response.data);
        setTotalPages(response.pagination.totalPages);
        setTotalCount(response.pagination.totalCount);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch meeting notes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await meetingNotesAPI.getMeetingNotesStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchMeetingNotes(), fetchStats()]);
    setRefreshing(false);
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const response = await meetingNotesAPI.deleteMeetingNote(noteId);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Meeting note deleted successfully',
        });
        fetchMeetingNotes();
        fetchStats();
        setShowDeleteConfirm(false);
        setSelectedNote(null);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete meeting note',
        variant: 'destructive',
      });
    }
  };

  const handleViewNote = (note: MeetingNote) => {
    setSelectedNote(note);
    setShowDetailModal(true);
  };

  const handleEditNote = (note: MeetingNote) => {
    setSelectedNote(note);
    setShowEditModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUniqueCategories = () => {
    const categories = meetingNotes.map(note => note.category).filter(Boolean);
    return Array.from(new Set(categories));
  };

  const getUniqueTags = () => {
    const tags = meetingNotes.flatMap(note => note.tags);
    return Array.from(new Set(tags));
  };

  const renderStatsCards = () => {
    if (!stats) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Notes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalNotes}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recent (7 days)</p>
                <p className="text-2xl font-bold text-gray-900">{stats.recentNotes}</p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Processing</p>
                <p className="text-2xl font-bold text-gray-900">{stats.processingNotes}</p>
              </div>
              <Zap className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">{stats.categoryStats?.length || 0}</p>
              </div>
              <Folder className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderMeetingNoteCard = (note: MeetingNote) => {
    const participantCount = note.participants.length;
    const hasTranscript = note.transcriptionStatus === 'completed';
    const hasSummary = note.summaryStatus === 'completed';

    return (
      <motion.div
        key={note._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                {note.meetingTitle}
              </h3>
              <p className="text-sm text-gray-500">
                {formatDate(note.meetingDate)}
              </p>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleViewNote(note)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEditNote(note)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Note
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => {
                    setSelectedNote(note);
                    setShowDeleteConfirm(true);
                  }}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Content */}
          <div className="space-y-3">
            {/* Participants */}
            <div className="flex items-center text-sm text-gray-600">
              <Users className="h-4 w-4 mr-2" />
              <span>{participantCount} participant{participantCount !== 1 ? 's' : ''}</span>
            </div>

            {/* Status badges */}
            <div className="flex items-center gap-2">
              <Badge 
                variant={hasTranscript ? "default" : "secondary"}
                className="text-xs"
              >
                {hasTranscript ? 'Transcript ✓' : 'No Transcript'}
              </Badge>
              <Badge 
                variant={hasSummary ? "default" : "secondary"}
                className="text-xs"
              >
                {hasSummary ? 'Summary ✓' : 'No Summary'}
              </Badge>
            </div>

            {/* Tags */}
            {note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {note.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {note.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{note.tags.length - 3} more
                  </Badge>
                )}
              </div>
            )}

            {/* Category */}
            {note.category && (
              <div className="flex items-center text-sm text-gray-600">
                <Folder className="h-4 w-4 mr-2" />
                <span>{note.category}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="flex items-center text-xs text-gray-500">
              <User className="h-3 w-3 mr-1" />
              {note.createdBy.name}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleViewNote(note)}
              className="text-xs"
            >
              View Details
            </Button>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderMeetingNoteListItem = (note: MeetingNote) => {
    const hasTranscript = note.transcriptionStatus === 'completed';
    const hasSummary = note.summaryStatus === 'completed';

    return (
      <motion.div
        key={note._id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-all duration-200"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-medium text-gray-900 truncate">
                  {note.meetingTitle}
                </h3>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                  <span>{formatDate(note.meetingDate)}</span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {note.participants.length}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {note.createdBy.name}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant={hasTranscript ? "default" : "secondary"} className="text-xs">
                  {hasTranscript ? 'Transcript' : 'No Transcript'}
                </Badge>
                <Badge variant={hasSummary ? "default" : "secondary"} className="text-xs">
                  {hasSummary ? 'Summary' : 'No Summary'}
                </Badge>
                {note.category && (
                  <Badge variant="outline" className="text-xs">
                    {note.category}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleViewNote(note)}
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEditNote(note)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => {
                    setSelectedNote(note);
                    setShowDeleteConfirm(true);
                  }}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Meeting Notes Manager
            </h1>
            <p className="text-gray-600">
              Manage and organize your meeting notes and transcripts
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Button
              onClick={() => window.location.href = '/meeting-notes'}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Meeting Note
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {renderStatsCards()}

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search meeting notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <Select value={categoryFilter || "all"} onValueChange={(value) => setCategoryFilter(value === "all" ? "" : value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {getUniqueCategories().map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={dateFilter || "all"} onValueChange={(value) => setDateFilter(value === "all" ? "" : value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last Week</SelectItem>
                    <SelectItem value="month">Last Month</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                  const [field, order] = value.split('-');
                  setSortBy(field as any);
                  setSortOrder(order as any);
                }}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meetingDate-desc">Date (Newest)</SelectItem>
                    <SelectItem value="meetingDate-asc">Date (Oldest)</SelectItem>
                    <SelectItem value="meetingTitle-asc">Title (A-Z)</SelectItem>
                    <SelectItem value="meetingTitle-desc">Title (Z-A)</SelectItem>
                    <SelectItem value="createdAt-desc">Created (Newest)</SelectItem>
                    <SelectItem value="createdAt-asc">Created (Oldest)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* View Mode */}
              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Meeting Notes Grid/List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : meetingNotes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No meeting notes found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || categoryFilter || dateFilter 
                  ? 'Try adjusting your filters or search terms'
                  : 'Create your first meeting note to get started'
                }
              </p>
              <Button
                onClick={() => window.location.href = '/meeting-notes'}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Meeting Note
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {meetingNotes.map(renderMeetingNoteCard)}
                </div>
              ) : (
                <div className="space-y-4">
                  {meetingNotes.map(renderMeetingNoteListItem)}
                </div>
              )}
            </AnimatePresence>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} results
                </p>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <MeetingNoteDetailModal
        meetingNote={selectedNote}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedNote(null);
        }}
        onEdit={(note) => {
          setShowDetailModal(false);
          setSelectedNote(note);
          setShowEditModal(true);
        }}
        onDelete={(note) => {
          setShowDetailModal(false);
          setSelectedNote(note);
          setShowDeleteConfirm(true);
        }}
      />

      {/* Edit Modal */}
      {showEditModal && selectedNote && (
        <EditMeetingNoteModal
          meetingNote={selectedNote}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedNote(null);
          }}
          onSave={async (updatedNote) => {
            try {
              const response = await meetingNotesAPI.updateMeetingNote(selectedNote._id, updatedNote);
              if (response.success) {
                toast({
                  title: 'Success',
                  description: 'Meeting note updated successfully',
                });
                fetchMeetingNotes();
                setShowEditModal(false);
                setSelectedNote(null);
              }
            } catch (error: any) {
              toast({
                title: 'Error',
                description: error.message || 'Failed to update meeting note',
                variant: 'destructive',
              });
            }
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedNote && (
        <DeleteConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false);
            setSelectedNote(null);
          }}
          onConfirm={() => handleDeleteNote(selectedNote._id)}
          title="Delete Meeting Note"
          description={`Are you sure you want to delete "${selectedNote.meetingTitle}"? This action cannot be undone.`}
        />
      )}
    </div>
  );
};

export default MeetingNotesManager;
