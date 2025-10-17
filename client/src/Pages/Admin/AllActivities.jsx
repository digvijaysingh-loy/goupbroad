
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MultipleStudentSelect } from '@/components/tasks/MultipleStudentSelect';
import { getAdminStudentActivities } from '@/services/adminActivityService';
import { getStudents } from '@/services/studentService';

const statusClasses = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  ACTIVE: 'bg-blue-100 text-blue-800 border-blue-300',
  COMPLETED: 'bg-green-100 text-green-800 border-green-300',
  REJECTED: 'bg-red-100 text-red-800 border-red-300',
};

const PAGE_SIZE = 10;

const AllActivities = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [activities, setActivities] = useState([]);
  const [students, setStudents] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch students for filter dropdown
  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await getStudents({ page: 1, limit: 100 });
        setStudents(res.data?.students || []);
      } catch (err) {
        setStudents([]);
        console.error('Failed to load students:', err);
      }
    }
    fetchStudents();
  }, []);

  // Fetch activities with filters and pagination
  useEffect(() => {
    async function fetchActivities() {
      setLoading(true);
      setError(null);
      try {
        const params = {
          page,
          limit: PAGE_SIZE,
          search: searchQuery || undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          students: selectedStudents.length > 0 ? selectedStudents.join(',') : undefined,
        };
        const res = await getAdminStudentActivities(params.page, params.limit, params);
        setActivities(res.data?.activities || []);
        setTotalPages(res.data?.pages || 1);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load activities');
      } finally {
        setLoading(false);
      }
    }
    fetchActivities();
  }, [searchQuery, statusFilter, selectedStudents, page]);

  const handleStudentsChange = (selected) => {
    setSelectedStudents(selected);
    setPage(1);
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">All Activities</h1>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <Input
          className="max-w-md"
          placeholder="Search activities..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={statusFilter} onValueChange={(e)=>{setSearchQuery('') ; handleStatusChange(e)}}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="SUBMITTED">Submitted</SelectItem>
              <SelectItem value="UPDATED">Updated</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>

          {/* <div className="w-[220px]">
            <MultipleStudentSelect
              students={students}
              selectedStudents={selectedStudents}
              onChange={handleStudentsChange}
            />
          </div> */}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Activities</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : loading ? (
            <div className="text-center text-muted-foreground">Loading...</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">No activities found.</TableCell>
                    </TableRow>
                  ) : (
                    activities.map((activity) => (
                      <TableRow
                        key={activity._id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => {
                          if (activity.applicationId) {
                            window.location.href = `/app/${activity.applicationId}`;
                          }
                        }}
                        title={activity.applicationId ? 'Go to application' : ''}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={activity.student?.image} alt={activity.student?.name} />
                              <AvatarFallback>{(activity.student?.name || activity.student?.email || 'U').split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{activity.student?.name || activity.student?.email || 'Unknown'}</span>
                          </div>
                        </TableCell>
                        <TableCell className='truncate max-w-[150px]' title={activity.activityType}>{activity.activityType || activity.type || '-'}</TableCell>
                        <TableCell>{activity.subject || activity.message || '-'}</TableCell>
                        <TableCell>{activity.createdAt ? new Date(activity.createdAt).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>
                          {activity.status && (
                            <Badge variant="outline" className={statusClasses[activity.status] || ''}>
                              {activity.status.toLowerCase()}
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
              {totalPages > 1 && 
              <div className="flex justify-end items-center gap-2 mt-4">
                <button
                  className="px-3 py-1 rounded border disabled:opacity-50"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <span>Page {page} of {totalPages}</span>
                <button
                  className="px-3 py-1 rounded border disabled:opacity-50"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </div>

              }
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AllActivities;
