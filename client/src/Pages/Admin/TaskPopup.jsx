// src/components/TaskPopup.jsx
import React, { useEffect, useState, memo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, X, ChevronDown, ChevronUp, FileText, CheckCircle, Clock, AlertCircle, Download, User, Calendar, MessageSquare } from 'lucide-react';
import { getStudentQuestionnaireResponses } from '@/services/api.services';

function TaskPopup({ task, onClose }) {
  const [responses, setResponses] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});               // studentId → true/false

  // -----------------------------------------------------------------
  // FETCH
  // -----------------------------------------------------------------
  const fetchResponses = async () => {
    if (!task?._id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getStudentQuestionnaireResponses(task._id, 1, 10);
      console.log('API RESPONSE:', res);
      if (res?.data?.success) setResponses(res.data.data);
      else setError('Failed to load responses');
    } catch (err) {
      console.error('API ERROR:', err);
      setError(err?.response?.data?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResponses();
  }, [task?._id]);

  // -----------------------------------------------------------------
  // TOGGLE EXPAND
  // -----------------------------------------------------------------
  const toggle = (studentId) => {
    setExpanded((prev) => ({ ...prev, [studentId]: !prev[studentId] }));
  };

  // -----------------------------------------------------------------
  // HELPERS
  // -----------------------------------------------------------------
  const statusIcon = (assignmentStatus) => {
    switch (assignmentStatus) {
      case 'COMPLETED': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'PENDING': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const answerDisplay = (q) => {
    if (!q.answer) return <span className="text-muted-foreground">Not answered</span>;

    if (q.ansType === 'FILE')
      return (
        <a href={q.answer} target="_blank" rel="noopener noreferrer"
           className="inline-flex items-center gap-1 text-blue-600 hover:underline">
          <Download className="h-3 w-3" /> View File
        </a>
      );

    if (q.ansType === 'CHECKBOX')
      return Array.isArray(q.answer) ? q.answer.join(', ') : q.answer;

    if (q.ansType === 'DATE')
      return new Date(q.answer).toLocaleDateString();

    return q.answer;
  };

  if (!task) return null;

  return (
    <Dialog open={!!task} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[820px] max-h-[90vh] overflow-y-auto p-0">
        {/* ---------- HEADER ---------- */}
        <DialogHeader className="p-6 pb-3 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                <FileText className="h-5 w-5" />
                {task.title}
              </DialogTitle>
              {task.description && (
                <DialogDescription className="mt-1 text-sm">
                  {task.description}
                </DialogDescription>
              )}
            </div>
            {/* <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button> */}
          </div>
        </DialogHeader>

        {/* ---------- BODY ---------- */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-2 text-sm text-muted-foreground">Loading responses…</p>
            </div>
          ) : error ? (
            <p className="text-center py-8 text-destructive">{error}</p>
          ) : !responses ? (
            <p className="text-center py-8 text-muted-foreground">No responses found.</p>
          ) : (
            <>
              {/* ---- SUMMARY CARDS ---- */}
              {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Students
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{responses.summary.totalStudents}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Questionnaires
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{responses.summary.totalQuestionnaires}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Responses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{responses.summary.totalResponses}</p>
                  </CardContent>
                </Card>
              </div> */}

              {/* ---- STUDENT LIST (Tailwind Collapsible) ---- */}
              <div className="space-y-4">
                {responses.data.map((student) => {
                  const isOpen = !!expanded[student._id];
                  const completed = student.questionnaires.filter(q => q.assignmentStatus === 'COMPLETED').length;
                  const total = student.questionnaires.length;
                  const percent = Math.round((completed / total) * 100);

                  return (
                    <Card key={student._id} className="overflow-hidden">
                      {/* ----- HEADER (clickable) ----- */}
                      <button
                        onClick={() => toggle(student._id)}
                        className="w-full text-left p-4 hover:bg-muted/50 transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">{student.name}</p>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {completed}/{total} Completed
                            </p>
                            <p className="text-xs text-muted-foreground">{percent}%</p>
                          </div>

                          <Badge
                            variant={completed === total ? 'success' : 'secondary'}
                            className="capitalize"
                          >
                            {completed === total ? 'Done' : 'In Progress'}
                          </Badge>

                          {isOpen ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </button>

                      {/* ----- COLLAPSIBLE CONTENT (Tailwind) ----- */}
                      <div
                        className={`transition-all duration-300 ease-in-out overflow-hidden ${
                          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                        }`}
                      >
                        <div className="border-t p-4 bg-muted/5 space-y-4">
                          {student.questionnaires.map((q) => (
                            <Card key={q.questionnaireId} className="border">
                              <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                    {statusIcon(q.assignmentStatus)}
                                    {q.title}
                                  </CardTitle>
                                  <Badge
                                    variant={
                                      q.assignmentStatus === 'COMPLETED'
                                        ? 'success'
                                        : 'secondary'
                                    }
                                  >
                                    {q.assignmentStatus}
                                  </Badge>
                                </div>

                                {q.subtask && (
                                  <p className="mt-1 text-sm text-muted-foreground">
                                    Subtask: {q.subtask.title}
                                  </p>
                                )}

                                <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  Assigned: {new Date(q.assignedAt).toLocaleDateString()}
                                </p>
                              </CardHeader>

                              <CardContent className="space-y-3">
                                {q.questions.map((ques) => (
                                  <div
                                    key={ques._id}
                                    className="p-3 bg-background rounded-md border space-y-2"
                                  >
                                    <div className="flex items-start justify-between">
                                      <p className="font-medium text-sm">{ques.question}</p>
                                      <Badge
                                        variant={ques.status === 'SUBMITTED' ? 'outline' : 'secondary'}
                                        className="text-xs"
                                      >
                                        {ques.status}
                                      </Badge>
                                    </div>

                                    <div className="text-sm text-muted-foreground">
                                      {answerDisplay(ques)}
                                    </div>

                                    {ques.submittedAt && (
                                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(ques.submittedAt).toLocaleString()}
                                      </p>
                                    )}

                                    {ques.feedback && (
                                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                                        <p className="flex items-start gap-1 text-xs text-green-800">
                                          <MessageSquare className="h-3 w-3 mt-0.5" />
                                          <span className="font-medium">Feedback:</span> {ques.feedback}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* ---------- FOOTER ---------- */}
        <DialogFooter className="p-4 border-t">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default memo(TaskPopup);