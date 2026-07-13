import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';

import Layout from './components/Layout';
import Home from './pages/Home';
import PasswordGenerator from './pages/PasswordGenerator';
import QrCodeGenerator from './pages/QrCodeGenerator';
import WordCounter from './pages/WordCounter';
import BmiCalculator from './pages/BmiCalculator';
import AgeCalculator from './pages/AgeCalculator';
import LoanCalculator from './pages/LoanCalculator';
import PercentageCalculator from './pages/PercentageCalculator';
import DiscountCalculator from './pages/DiscountCalculator';
import TextCaseConverter from './pages/TextCaseConverter';
import RandomNumberGenerator from './pages/RandomNumberGenerator';
import CertificateGenerator from './pages/CertificateGenerator';
import ResumeBuilder from './pages/ResumeBuilder';
import InvoiceGenerator from './pages/InvoiceGenerator';
import About from './pages/About';
// PDF Tools
import PdfMerge from './pages/PdfMerge';
import PdfSplit from './pages/PdfSplit';
import PdfCompressor from './pages/PdfCompressor';
import WordToPdf from './pages/WordToPdf';
import PdfToWord from './pages/PdfToWord';
import JpgToPdf from './pages/JpgToPdf';
import PdfToJpg from './pages/PdfToJpg';
import RotatePdf from './pages/RotatePdf';
import UnlockPdf from './pages/UnlockPdf';
import ProtectPdf from './pages/ProtectPdf';
// Image Tools
import ImageCompressor from './pages/ImageCompressor';
import ImageResizer from './pages/ImageResizer';
import ImageCropper from './pages/ImageCropper';
import ImageConverter from './pages/ImageConverter';
import ImageToPdf from './pages/ImageToPdf';
import WatermarkImage from './pages/WatermarkImage';
import PhotoCollageMaker from './pages/PhotoCollageMaker';
import ColorPicker from './pages/ColorPicker';
import BlurImage from './pages/BlurImage';
import SharpenImage from './pages/SharpenImage';
// Sprint 5 — Calculators
import CalorieCalculator from './pages/CalorieCalculator';
import BodyFatCalculator from './pages/BodyFatCalculator';
import PregnancyCalculator from './pages/PregnancyCalculator';
import OvulationCalculator from './pages/OvulationCalculator';
import SalaryCalculator from './pages/SalaryCalculator';
import TaxCalculator from './pages/TaxCalculator';
import CurrencyConverter from './pages/CurrencyConverter';
import ElectricityBillCalculator from './pages/ElectricityBillCalculator';
import FuelCostCalculator from './pages/FuelCostCalculator';
// Sprint 5 — Daily Life
import GroceryList from './pages/GroceryList';
import MealPlanner from './pages/MealPlanner';
import WeeklyPlanner from './pages/WeeklyPlanner';
import MonthlyPlanner from './pages/MonthlyPlanner';
import TodoList from './pages/TodoList';
import ShoppingList from './pages/ShoppingList';
import ChoreChart from './pages/ChoreChart';
import BirthdayReminder from './pages/BirthdayReminder';
import AnniversaryReminder from './pages/AnniversaryReminder';
import GiftIdeaGenerator from './pages/GiftIdeaGenerator';
// V2 Text Tools
import ReadingTimeCalculator from './pages/ReadingTimeCalculator';
import FindReplace from './pages/FindReplace';
import RemoveDuplicates from './pages/RemoveDuplicates';
import TextSorter from './pages/TextSorter';
import NotesPad from './pages/NotesPad';
import MarkdownEditor from './pages/MarkdownEditor';
// V2 Developer Tools
import JsonFormatter from './pages/JsonFormatter';
import Base64Tool from './pages/Base64Tool';
import UrlEncoder from './pages/UrlEncoder';
import HashGenerator from './pages/HashGenerator';
import UuidGenerator from './pages/UuidGenerator';

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/password-generator" component={PasswordGenerator} />
        <Route path="/qr-code-generator" component={QrCodeGenerator} />
        <Route path="/word-counter" component={WordCounter} />
        <Route path="/bmi-calculator" component={BmiCalculator} />
        <Route path="/age-calculator" component={AgeCalculator} />
        <Route path="/loan-calculator" component={LoanCalculator} />
        <Route path="/percentage-calculator" component={PercentageCalculator} />
        <Route path="/discount-calculator" component={DiscountCalculator} />
        <Route path="/text-case-converter" component={TextCaseConverter} />
        <Route path="/random-number-generator" component={RandomNumberGenerator} />
        <Route path="/certificate-generator" component={CertificateGenerator} />
        <Route path="/resume-builder" component={ResumeBuilder} />
        <Route path="/invoice-generator" component={InvoiceGenerator} />
        <Route path="/about" component={About} />
        {/* PDF Tools */}
        <Route path="/pdf-merge" component={PdfMerge} />
        <Route path="/pdf-split" component={PdfSplit} />
        <Route path="/pdf-compressor" component={PdfCompressor} />
        <Route path="/word-to-pdf" component={WordToPdf} />
        <Route path="/pdf-to-word" component={PdfToWord} />
        <Route path="/jpg-to-pdf" component={JpgToPdf} />
        <Route path="/pdf-to-jpg" component={PdfToJpg} />
        <Route path="/rotate-pdf" component={RotatePdf} />
        <Route path="/unlock-pdf" component={UnlockPdf} />
        <Route path="/protect-pdf" component={ProtectPdf} />
        {/* Image Tools */}
        <Route path="/image-compressor" component={ImageCompressor} />
        <Route path="/image-resizer" component={ImageResizer} />
        <Route path="/image-cropper" component={ImageCropper} />
        <Route path="/image-converter" component={ImageConverter} />
        <Route path="/image-to-pdf" component={ImageToPdf} />
        <Route path="/watermark-image" component={WatermarkImage} />
        <Route path="/photo-collage-maker" component={PhotoCollageMaker} />
        <Route path="/color-picker" component={ColorPicker} />
        <Route path="/blur-image" component={BlurImage} />
        <Route path="/sharpen-image" component={SharpenImage} />
        {/* Sprint 5 — Calculators */}
        <Route path="/calorie-calculator" component={CalorieCalculator} />
        <Route path="/body-fat-calculator" component={BodyFatCalculator} />
        <Route path="/pregnancy-calculator" component={PregnancyCalculator} />
        <Route path="/ovulation-calculator" component={OvulationCalculator} />
        <Route path="/salary-calculator" component={SalaryCalculator} />
        <Route path="/tax-calculator" component={TaxCalculator} />
        <Route path="/currency-converter" component={CurrencyConverter} />
        <Route path="/electricity-bill-calculator" component={ElectricityBillCalculator} />
        <Route path="/fuel-cost-calculator" component={FuelCostCalculator} />
        {/* Sprint 5 — Daily Life */}
        <Route path="/grocery-list" component={GroceryList} />
        <Route path="/meal-planner" component={MealPlanner} />
        <Route path="/weekly-planner" component={WeeklyPlanner} />
        <Route path="/monthly-planner" component={MonthlyPlanner} />
        <Route path="/todo-list" component={TodoList} />
        <Route path="/shopping-list" component={ShoppingList} />
        <Route path="/chore-chart" component={ChoreChart} />
        <Route path="/birthday-reminder" component={BirthdayReminder} />
        <Route path="/anniversary-reminder" component={AnniversaryReminder} />
        <Route path="/gift-idea-generator" component={GiftIdeaGenerator} />
        {/* V2 Text Tools */}
        <Route path="/reading-time-calculator" component={ReadingTimeCalculator} />
        <Route path="/find-replace" component={FindReplace} />
        <Route path="/remove-duplicates" component={RemoveDuplicates} />
        <Route path="/text-sorter" component={TextSorter} />
        <Route path="/notes-pad" component={NotesPad} />
        <Route path="/markdown-editor" component={MarkdownEditor} />
        {/* V2 Developer Tools */}
        <Route path="/json-formatter" component={JsonFormatter} />
        <Route path="/base64" component={Base64Tool} />
        <Route path="/url-encoder" component={UrlEncoder} />
        <Route path="/hash-generator" component={HashGenerator} />
        <Route path="/uuid-generator" component={UuidGenerator} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;