# Insulin Tracker - Advanced Health Monitoring Application

A comprehensive and attractive frontend website for tracking insulin resistance and diabetes risk through three different assessment models.

## Features

### 🔐 Authentication System
- Beautiful login and signup pages with form validation
- Multi-step registration with password strength indicator
- Secure session management with localStorage

### 📊 Three Assessment Models

#### Basic Assessment
- Age, Sex, BMI, and Waist Circumference
- Quick 5-minute health check
- Real-time BMI calculation
- Visual risk indicators

#### Intermediate Assessment
- All Basic metrics plus:
- Fasting Blood Glucose
- Triglycerides
- Enhanced risk scoring
- Blood marker status indicators

#### Advanced Assessment
- All Intermediate metrics plus:
- HDL Cholesterol
- Blood Pressure (Systolic/Diastolic)
- Exercise Habits (Frequency, Intensity, Duration)
- Comprehensive lifestyle evaluation

### 📈 Results & Analytics
- Interactive charts and visualizations using Recharts
- Personalized health recommendations
- Risk level assessment with color coding
- Progress tracking over time
- Downloadable reports

### 📱 Responsive Design
- Mobile-first approach
- Beautiful glass morphism UI
- Smooth animations with Framer Motion
- Tailwind CSS for modern styling
- Works seamlessly on all devices

### 🔄 Additional Features
- Assessment history tracking
- Profile management
- Export functionality
- Data visualization
- Health tips and recommendations

## Technology Stack

- **Frontend**: React 18
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Heroicons & Lucide React
- **Routing**: React Router DOM
- **Build Tool**: Create React App

## Getting Started

### Prerequisites
- Node.js 14 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd insulin-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
insulin-tracker/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── Navbar.js
│   ├── context/
│   │   └── AuthContext.js
│   ├── pages/
│   │   ├── Login.js
│   │   ├── Signup.js
│   │   ├── Dashboard.js
│   │   ├── BasicAssessment.js
│   │   ├── IntermediateAssessment.js
│   │   ├── AdvancedAssessment.js
│   │   ├── Results.js
│   │   ├── History.js
│   │   └── Profile.js
│   ├── App.js
│   ├── index.css
│   └── index.js
├── tailwind.config.js
├── package.json
└── README.md
```

## Features Breakdown

### Authentication Flow
1. **Signup**: Multi-step form with validation
2. **Login**: Secure authentication with form validation
3. **Session Management**: Persistent login state

### Assessment Flow
1. **Dashboard**: Choose assessment type (Basic/Intermediate/Advanced)
2. **Multi-step Forms**: Progressive data collection with validation
3. **Real-time Calculations**: BMI, risk scores, health indicators
4. **Results**: Comprehensive analysis with visualizations

### Data Management
- LocalStorage for data persistence
- Assessment history tracking
- Export functionality for data portability

## UI/UX Features

### Design System
- Glass morphism effects
- Gradient backgrounds
- Consistent color scheme
- Modern typography

### Interactions
- Smooth page transitions
- Hover effects on interactive elements
- Loading states
- Form validation feedback
- Micro-animations

### Responsive Design
- Mobile-first approach
- Flexible grid layouts
- Touch-friendly interfaces
- Optimized for all screen sizes

## Risk Assessment Algorithm

The application uses a comprehensive scoring system that considers:
- Age-related risk factors
- BMI categories
- Waist circumference thresholds
- Blood glucose levels
- Triglyceride levels
- HDL cholesterol
- Blood pressure readings
- Exercise habits

## Future Enhancements

- Backend API integration
- Real database storage
- Advanced analytics
- Machine learning predictions
- Telemedicine integration
- Wearable device integration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.

---

**Note**: This is a frontend-only application. All data is stored locally in the browser. For production use, integrate with a proper backend API and database.
