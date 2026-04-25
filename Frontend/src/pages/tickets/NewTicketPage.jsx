import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, CheckCircle2Icon, UploadCloudIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardFooter, CardHeader } from '../../components/ui/Card';
import { createIssueReport, uploadFile } from '../../api/issues';
import { appRoutes } from '../../utils/routes';

export function NewTicketPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('LOW');
  const [description, setDescription] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');

  const isPhoneValid = phoneNumber.length === 10;
  const isValid = title && category && description && isPhoneValid;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isValid) return;

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const attachmentUrls = [];
      if (selectedFile) {
        const uploadRes = await uploadFile(selectedFile);
        if (uploadRes && uploadRes.url) {
          attachmentUrls.push(`http://localhost:8080${uploadRes.url}`);
        }
      }

      await createIssueReport({
        title,
        description,
        category,
        priority,
        phoneNumber,
        attachmentUrls
      });

      setIsSubmitting(false);
      setShowSuccess(true);
      setTimeout(() => {
        navigate(appRoutes.tickets);
      }, 1200);
    } catch (error) {
      setIsSubmitting(false);
      setErrorMessage(error.message || 'Failed to submit ticket.');
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="px-2">
          <ArrowLeftIcon className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Report an Issue</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Submit a maintenance or support ticket</p>
        </div>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400"
          >
            <CheckCircle2Icon className="h-5 w-5" />
            <span className="font-medium">Ticket submitted successfully! Redirecting...</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400"
          >
            <span className="font-medium">{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Issue Details</h2>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Issue Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Brief summary of the issue"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-purple dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Phone number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="tel"
                value={phoneNumber}
                onChange={(event) => {
                  const digitsOnly = event.target.value.replace(/\D/g, '').slice(0, 10);
                  setPhoneNumber(digitsOnly);
                }}
                placeholder="10-digit contact number"
                maxLength={10}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-purple dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                required
                aria-invalid={phoneNumber.length > 0 && !isPhoneValid}
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Enter exactly 10 digits (numbers only).</p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-purple dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  required
                >
                  <option value="">Select category...</option>
                  <option value="Hardware">Hardware / IT</option>
                  <option value="Facilities">Facilities / Maintenance</option>
                  <option value="Supplies">Supplies</option>
                  <option value="Software">Software</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Urgency Level</label>
                <select
                  value={priority}
                  onChange={(event) => setPriority(event.target.value)}
                  className="w-full cursor-pointer rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-purple dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="LOW">Low - Not urgent</option>
                  <option value="MEDIUM">Medium - Needs attention soon</option>
                  <option value="HIGH">High - Impacting work/classes</option>
                  <option value="CRITICAL">Critical - Immediate hazard/blocker</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Please provide detailed information about the issue..."
                className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-purple dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Evidence / Photos (Optional)</label>
              <div className="relative cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-slate-300 p-8 text-center transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50">
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/gif, image/svg+xml"
                  className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                  onChange={(event) => {
                    const files = event.target.files;
                    if (files && files.length > 0) {
                      const file = files[0];
                      setSelectedFile(file);
                      setFilePreview(URL.createObjectURL(file));
                    }
                  }}
                />
                {!filePreview ? (
                  <>
                    <UploadCloudIcon className="mx-auto mb-3 h-10 w-10 text-slate-400" />
                    <p className="mb-1 text-sm font-medium text-slate-900 dark:text-white">Click to upload or drag and drop</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">SVG, PNG, JPG or GIF (max. 5MB)</p>
                  </>
                ) : (
                  <div className="relative z-0 flex flex-col items-center">
                    <img src={filePreview} alt="Preview" className="mb-2 max-h-32 rounded-md object-contain" />
                    <p className="max-w-[200px] truncate text-sm font-medium text-brand-purple">{selectedFile.name}</p>
                    <p className="text-xs text-slate-500">Click or drag to replace</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || isSubmitting} isLoading={isSubmitting}>
              Submit Ticket
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
