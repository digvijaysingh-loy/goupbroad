import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSubtaskQuestionnaires } from '@/services/questionnaireService';
import { toast } from 'sonner';
import { SidebarProvider, SidebarInset } from '../../components/ui/sidebar';
import AppSidebar from '../../components/AppSidebar';
import SidebarHeader from '../../components/SidebarHeader';
import { ArrowLeft } from 'lucide-react';

const QuestionnaireList = () => {
  const { taskId, subtaskId } = useParams();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [questionnaires, setQuestionnaires] = useState([]);
  const [error, setError] = useState(null);
  const [taskInfo, setTaskInfo] = useState({
    taskTitle: '',
    subtaskTitle: ''
  });

  const fetchQuestionnaires = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getSubtaskQuestionnaires(taskId, subtaskId);
      
      if (response.success && response.data?.questionnaires) {
        setQuestionnaires(response.data.questionnaires);
        
        // Get task and subtask info if available
        if (response.data.task) {
          setTaskInfo({
            taskTitle: response.data.task.title || '',
            subtaskTitle: response.data.subtask?.title || ''
          });
        }
      } else {
        setError('No questionnaires found for this subtask');
      }
    } catch (err) {
      console.error('Error fetching questionnaires:', err);
      setError('Failed to load questionnaires');
      toast.error('Failed to load questionnaires');
    } finally {
      setIsLoading(false);
    }
  }, [taskId, subtaskId]);

  useEffect(() => {
    fetchQuestionnaires();
  }, [fetchQuestionnaires]);

  const handleQuestionnaireSelect = (questionnaireId) => {
    navigate(`/questionnaire/${taskId}/${subtaskId}/${questionnaireId}`);
  };

  const handleGoBack = () => { 
    navigate(-1);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <AppSidebar isSidebarOpen={isSidebarOpen} />
        
        <SidebarInset>
          <SidebarHeader isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
          
          <main className="flex-1 w-full overflow-x-hidden overflow-y-auto bg-gray-50 p-4 pt-8 md:p-6 md:pt-10">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="w-full">
                <div className="flex items-center justify-between mb-4">
                  <button 
                    onClick={handleGoBack}
                    className="flex items-center text-primary-1 hover:text-teal-700"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    <span>Back to Tasks</span>
                  </button>
                  
                  <h2 className="text-xl font-semibold text-primary-1">
                    Available Questionnaires
                  </h2>
                </div>
                
                {taskInfo.taskTitle && (
                  <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                    <p className="text-gray-800 font-medium">
                      {taskInfo.taskTitle}
                    </p>
                    {taskInfo.subtaskTitle && (
                      <p className="text-gray-600 text-sm mt-1">
                        Subtask: {taskInfo.subtaskTitle}
                      </p>
                    )}
                  </div>
                )}
                
                {isLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="mb-4 rounded-lg overflow-hidden bg-white animate-pulse">
                      <div className="p-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))
                ) : error ? (
                  <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                    <p className="text-red-500">{error}</p>
                    <button 
                      onClick={handleGoBack}
                      className="mt-4 bg-primary-1 text-white py-2 px-4 rounded-md hover:bg-teal-700"
                    >
                      Go Back
                    </button>
                  </div>
                ) : questionnaires.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                    <p className="text-gray-500">No questionnaires available for this subtask.</p>
                    <button 
                      onClick={handleGoBack}
                      className="mt-4 bg-primary-1 text-white py-2 px-4 rounded-md hover:bg-teal-700"
                    >
                      Go Back
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {questionnaires.map((questionnaire, index) => (
                      <div 
                        key={questionnaire.questionnaireId} 
                        className={`bg-white rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer ${
                          index % 2 === 0 ? 'border-l-4 border-primary-1' : 'border-l-4 border-orange-500'
                        }`}
                        onClick={() => handleQuestionnaireSelect(questionnaire.questionnaireId)}
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-gray-800">
                            {questionnaire.title || 'Untitled Questionnaire'}
                          </h3>
                          
                          <button 
                            className="bg-primary-1 cursor-pointer hover:bg-teal-800 text-white text-xs font-medium py-2 px-5 rounded"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuestionnaireSelect(questionnaire.questionnaireId);
                            }}
                          >
                            Start Questionnaire
                          </button>
                        </div>
                        
                        {questionnaire.description && (
                          <p className="text-gray-600 mt-2 line-clamp-2">
                            {questionnaire.description}
                          </p>
                        )}
                        
                        <div className="flex justify-between items-center mt-4 text-sm">
                          <div>
                            {/* <span className="text-gray-600">Questions: </span>
                            <span className="font-medium bg-gray-50 px-2 py-0.5 rounded-xs">
                              {questionnaire.totalQuestions || 0}
                            </span>   */}
                            
                            {questionnaire.estimatedTime && (
                              <>
                                <span className="text-gray-400 mx-2">|</span>
                                <span className="text-gray-600">Estimated time: </span>
                                <span className="font-medium bg-gray-50 px-2 py-0.5 rounded-xs">
                                  {questionnaire.estimatedTime}
                                </span>
                              </>
                            )}
                          </div>
                          
                          <span className={`text-xs px-3 py-1 rounded-full ${
                            questionnaire.status === 'COMPLETED' 
                              ? 'bg-green-100 text-green-800' 
                              : questionnaire.status === 'IN_PROGRESS'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-primary-1/10 text-primary-1'
                          }`}>
                            {questionnaire.status || 'Ready to start'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default QuestionnaireList;
