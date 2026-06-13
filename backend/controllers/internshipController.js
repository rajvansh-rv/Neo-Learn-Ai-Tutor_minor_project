import InternshipSearch from '../models/InternshipSearch.js';
import asyncHandler from '../middleware/asyncHandler.js';

export const getInternships = asyncHandler(async (req, res, next) => {
        const domain = req.query.domain || '';
        const searchLower = domain.toLowerCase();

        // High-quality mock database
        const mockInternships = [
            // Frontend
            { id: 1, title: "Frontend Developer Intern", company: "ABC Tech", location: "Remote", stipend: "₹10,000/month", duration: "3 months", description: "Work on React-based applications and build responsive web interfaces.", applyLink: "https://www.linkedin.com/jobs/search/?keywords=Frontend%20Developer%20Intern" },
            { id: 11, title: "ReactJS Intern", company: "Webify", location: "Pune, India", stipend: "₹12,000/month", duration: "6 months", description: "Build modern web applications using React, Redux, and Tailwind.", applyLink: "https://www.linkedin.com/jobs/search/?keywords=React%20Intern" },
            { id: 12, title: "Frontend Engineer Intern", company: "NextGen UI", location: "Remote", stipend: "₹15,000/month", duration: "3 months", description: "Focus on UI/UX optimization and frontend performance using Vue.js.", applyLink: "https://www.linkedin.com/jobs/search/?keywords=Frontend%20Engineer%20Intern" },
            
            // Backend
            { id: 2, title: "Backend Engineering Intern", company: "DataFlow Systems", location: "Bengaluru, India", stipend: "₹15,000/month", duration: "6 months", description: "Develop REST APIs using Node.js, Express, and MongoDB.", applyLink: "https://www.linkedin.com/jobs/search/?keywords=Backend%20Engineering%20Intern" },
            { id: 13, title: "Node.js Developer Intern", company: "ServerStack", location: "Remote", stipend: "₹18,000/month", duration: "4 months", description: "Build scalable backend microservices and integrate with AWS.", applyLink: "https://www.linkedin.com/jobs/search/?keywords=Node.js%20Developer%20Intern" },
            { id: 14, title: "Python Backend Intern", company: "ApiWorks", location: "Hyderabad, India", stipend: "₹10,000/month", duration: "3 months", description: "Develop high-performance APIs using FastAPI and PostgreSQL.", applyLink: "https://www.linkedin.com/jobs/search/?keywords=Python%20Backend%20Intern" },
            
            // Data Science / AI / ML
            { id: 3, title: "Data Science Intern", company: "Insights AI", location: "Remote", stipend: "₹12,000/month", duration: "3 months", description: "Clean data and build predictive models using Python and Pandas.", applyLink: "https://www.linkedin.com/jobs/search/?keywords=Data%20Science%20Intern" },
            { id: 4, title: "Machine Learning Intern", company: "NeuralNet Corp", location: "Hyderabad, India", stipend: "₹20,000/month", duration: "6 months", description: "Assist in training and deploying deep learning models using TensorFlow.", applyLink: "https://www.linkedin.com/jobs/search/?keywords=Machine%20Learning%20Intern" },
            { id: 10, title: "AI Research Intern", company: "Future Labs", location: "Remote", stipend: "₹20,000/month", duration: "3 months", description: "Research and implement state-of-the-art NLP algorithms.", applyLink: "https://www.linkedin.com/jobs/search/?keywords=AI%20Research%20Intern" },
            { id: 15, title: "Data Analyst Intern", company: "DataMetrics", location: "Bengaluru, India", stipend: "₹10,000/month", duration: "3 months", description: "Visualize data trends and build dashboards using Tableau and SQL.", applyLink: "https://www.linkedin.com/jobs/search/?keywords=Data%20Analyst%20Intern" },
            { id: 16, title: "Computer Vision Intern", company: "OpticAI", location: "Remote", stipend: "₹25,000/month", duration: "6 months", description: "Work on real-time object detection models using PyTorch and OpenCV.", applyLink: "https://www.linkedin.com/jobs/search/?keywords=Computer%20Vision%20Intern" },

            // Full Stack
            { id: 6, title: "Full Stack Web Intern", company: "Startup Hub", location: "Remote", stipend: "₹12,000/month", duration: "4 months", description: "End-to-end development with the MERN stack.", applyLink: "https://www.linkedin.com/jobs/search/?keywords=Full%20Stack%20Web%20Intern" },
            { id: 17, title: "Full Stack Developer Intern", company: "CodeCrafters", location: "Mumbai, India", stipend: "₹15,000/month", duration: "6 months", description: "Build scalable web apps using Next.js, Node.js, and Postgres.", applyLink: "https://www.linkedin.com/jobs/search/?keywords=Full%20Stack%20Developer%20Intern" },
            { id: 18, title: "Software Engineer Intern (Full Stack)", company: "AgileSoft", location: "Remote", stipend: "₹20,000/month", duration: "3 months", description: "Work across the entire stack fixing bugs and shipping new features.", applyLink: "https://www.linkedin.com/jobs/search/?keywords=Full%20Stack%20Intern" },
            { id: 19, title: "MERN Stack Intern", company: "DevLaunch", location: "Noida, India", stipend: "₹10,000/month", duration: "3 months", description: "Create full-stack applications from scratch using MongoDB, Express, React, and Node.", applyLink: "https://www.linkedin.com/jobs/search/?keywords=MERN%20Stack%20Intern" },

            // UI/UX & Cloud/Cybersecurity
            { id: 5, title: "UI/UX Design Intern", company: "Creative Studio", location: "Pune, India", stipend: "₹8,000/month", duration: "2 months", description: "Create user flows, wireframes, and high-fidelity mockups in Figma.", applyLink: "https://www.linkedin.com/jobs/search/?keywords=UI%20UX%20Design%20Intern" },
            { id: 7, title: "Software Engineering Intern", company: "Tech Giant India", location: "Gurugram, India", stipend: "₹25,000/month", duration: "6 months", description: "Work with cross-functional teams to build scalable enterprise solutions.", applyLink: "https://www.linkedin.com/jobs/search/?keywords=Software%20Engineering%20Intern" },
            { id: 8, title: "Cybersecurity Analyst Intern", company: "SecureNet", location: "Remote", stipend: "₹15,000/month", duration: "3 months", description: "Perform vulnerability assessments and assist with penetration testing.", applyLink: "https://www.linkedin.com/jobs/search/?keywords=Cybersecurity%20Analyst%20Intern" },
            { id: 9, title: "Cloud Computing Intern", company: "CloudScale", location: "Bengaluru, India", stipend: "₹18,000/month", duration: "6 months", description: "Assist in managing AWS infrastructure and CI/CD pipelines.", applyLink: "https://www.linkedin.com/jobs/search/?keywords=Cloud%20Computing%20Intern" }
        ];

        // Filter logic
        let results = mockInternships;
        if (searchLower) {
            results = mockInternships.filter(internship => {
                return internship.title.toLowerCase().includes(searchLower) ||
                       internship.description.toLowerCase().includes(searchLower) ||
                       internship.company.toLowerCase().includes(searchLower);
            });
        }

        let limitedResults = results.slice(0, 8);

        // Save search history if user is logged in
        if (req.user && searchLower) {
            try {
                await InternshipSearch.create({
                    userId: req.user._id,
                    domain: searchLower,
                    resultsCount: limitedResults.length
                });
            } catch (err) {
                console.error("Failed to save internship search history:", err);
            }
        }

    res.json({
        success: true,
        internships: limitedResults
    });
});
