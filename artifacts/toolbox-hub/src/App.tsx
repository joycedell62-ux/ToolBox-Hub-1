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
import Vision from './pages/Vision';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
// PDF Tools
import PdfMerge from './pages/PdfMerge';
import PdfSplit from './pages/PdfSplit';
import PdfCompressor from './pages/PdfCompressor';
import TextDiff from './pages/TextDiff';
import JsonCsvConverter from './pages/JsonCsvConverter';
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
// Writing Generators
import BusinessNameGenerator from './pages/BusinessNameGenerator';
import SloganGenerator from './pages/SloganGenerator';
import BrandNameGenerator from './pages/BrandNameGenerator';
import UsernameGenerator from './pages/UsernameGenerator';
import MissionStatementGenerator from './pages/MissionStatementGenerator';
import LoveLetterGenerator from './pages/LoveLetterGenerator';
import BirthdayMessageGenerator from './pages/BirthdayMessageGenerator';
import AnniversaryMessageGenerator from './pages/AnniversaryMessageGenerator';
import ThankYouLetterGenerator from './pages/ThankYouLetterGenerator';
import ApologyLetterGenerator from './pages/ApologyLetterGenerator';
// Fun & Lifestyle
import AskAbigail from './pages/AskAbigail';
import DailyFortune from './pages/DailyFortune';
import RandomJokeGenerator from './pages/RandomJokeGenerator';
import WordMeaningGenerator from './pages/WordMeaningGenerator';
import WouldYouRatherGenerator from './pages/WouldYouRatherGenerator';
import ConversationStarterGenerator from './pages/ConversationStarterGenerator';
import IcebreakerGenerator from './pages/IcebreakerGenerator';
import RandomFactGenerator from './pages/RandomFactGenerator';
import BucketListGenerator from './pages/BucketListGenerator';
// Writing Generators V2
import ScriptGenerator from './pages/ScriptGenerator';
import SpeechGenerator from './pages/SpeechGenerator';
import StoryGenerator from './pages/StoryGenerator';
import BookOutlineGenerator from './pages/BookOutlineGenerator';
import BookChapterGenerator from './pages/BookChapterGenerator';
import DialogueGenerator from './pages/DialogueGenerator';
import EssayGenerator from './pages/EssayGenerator';
import ProposalGenerator from './pages/ProposalGenerator';
import PressReleaseGenerator from './pages/PressReleaseGenerator';
// Branding & Design
import LogoGenerator from './pages/LogoGenerator';
import LogoIdeaGenerator from './pages/LogoIdeaGenerator';
import ColorPaletteGenerator from './pages/ColorPaletteGenerator';
import FontPairingGenerator from './pages/FontPairingGenerator';
import BrandStyleGuideGenerator from './pages/BrandStyleGuideGenerator';
import BusinessCardDesigner from './pages/BusinessCardDesigner';
import FlyerGenerator from './pages/FlyerGenerator';
import PosterGenerator from './pages/PosterGenerator';
import BannerCreator from './pages/BannerCreator';
import SocialMediaBrandKitGenerator from './pages/SocialMediaBrandKitGenerator';
// Marketing Tools
import ProductNameGenerator from './pages/ProductNameGenerator';
import AdCopyGenerator from './pages/AdCopyGenerator';
import EmailSubjectLineGenerator from './pages/EmailSubjectLineGenerator';
import CallToActionGenerator from './pages/CallToActionGenerator';
import MarketingPlanGenerator from './pages/MarketingPlanGenerator';
import ContentCalendarGenerator from './pages/ContentCalendarGenerator';
import ProductDescriptionGenerator from './pages/ProductDescriptionGenerator';
// Utility V2
import QrScanner from './pages/QrScanner';
import BarcodeGenerator from './pages/BarcodeGenerator';
import BarcodeScanner from './pages/BarcodeScanner';
import SignatureGenerator from './pages/SignatureGenerator';
import DigitalSignatureCreator from './pages/DigitalSignatureCreator';
import InvoiceNumberGenerator from './pages/InvoiceNumberGenerator';
import PasswordStrengthChecker from './pages/PasswordStrengthChecker';
import FileChecksumGenerator from './pages/FileChecksumGenerator';
// Professional & Identity
import IdCardGenerator from './pages/IdCardGenerator';
import EmailSignatureGenerator from './pages/EmailSignatureGenerator';
import CoverLetterGenerator from './pages/CoverLetterGenerator';
import PassportPhotoMaker from './pages/PassportPhotoMaker';
import AppointmentCardGenerator from './pages/AppointmentCardGenerator';
import ShippingLabelGenerator from './pages/ShippingLabelGenerator';

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />
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
        <Route path="/vision" component={Vision} />
        {/* PDF Tools */}
        <Route path="/pdf-merge" component={PdfMerge} />
        <Route path="/pdf-split" component={PdfSplit} />
        <Route path="/pdf-compressor" component={PdfCompressor} />
        <Route path="/text-diff" component={TextDiff} />
        <Route path="/json-csv" component={JsonCsvConverter} />
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
        {/* Writing Generators */}
        <Route path="/business-name-generator" component={BusinessNameGenerator} />
        <Route path="/slogan-generator" component={SloganGenerator} />
        <Route path="/brand-name-generator" component={BrandNameGenerator} />
        <Route path="/username-generator" component={UsernameGenerator} />
        <Route path="/mission-statement-generator" component={MissionStatementGenerator} />
        <Route path="/love-letter-generator" component={LoveLetterGenerator} />
        <Route path="/birthday-message-generator" component={BirthdayMessageGenerator} />
        <Route path="/anniversary-message-generator" component={AnniversaryMessageGenerator} />
        <Route path="/thank-you-letter-generator" component={ThankYouLetterGenerator} />
        <Route path="/apology-letter-generator" component={ApologyLetterGenerator} />
        {/* Fun & Lifestyle */}
        <Route path="/ask-abigail" component={AskAbigail} />
        <Route path="/daily-fortune" component={DailyFortune} />
        <Route path="/random-joke-generator" component={RandomJokeGenerator} />
        <Route path="/word-meaning-generator" component={WordMeaningGenerator} />
        <Route path="/would-you-rather" component={WouldYouRatherGenerator} />
        <Route path="/conversation-starter-generator" component={ConversationStarterGenerator} />
        <Route path="/icebreaker-questions" component={IcebreakerGenerator} />
        <Route path="/random-fact-generator" component={RandomFactGenerator} />
        <Route path="/bucket-list-generator" component={BucketListGenerator} />
        {/* Writing Generators V2 */}
        <Route path="/script-generator" component={ScriptGenerator} />
        <Route path="/speech-generator" component={SpeechGenerator} />
        <Route path="/story-generator" component={StoryGenerator} />
        <Route path="/book-outline-generator" component={BookOutlineGenerator} />
        <Route path="/book-chapter-generator" component={BookChapterGenerator} />
        <Route path="/dialogue-generator" component={DialogueGenerator} />
        <Route path="/essay-generator" component={EssayGenerator} />
        <Route path="/proposal-generator" component={ProposalGenerator} />
        <Route path="/press-release-generator" component={PressReleaseGenerator} />
        {/* Branding & Design */}
        <Route path="/logo-generator" component={LogoGenerator} />
        <Route path="/logo-idea-generator" component={LogoIdeaGenerator} />
        <Route path="/color-palette-generator" component={ColorPaletteGenerator} />
        <Route path="/font-pairing-generator" component={FontPairingGenerator} />
        <Route path="/brand-style-guide-generator" component={BrandStyleGuideGenerator} />
        <Route path="/business-card-designer" component={BusinessCardDesigner} />
        <Route path="/flyer-generator" component={FlyerGenerator} />
        <Route path="/poster-generator" component={PosterGenerator} />
        <Route path="/banner-creator" component={BannerCreator} />
        <Route path="/social-media-brand-kit" component={SocialMediaBrandKitGenerator} />
        {/* Marketing Tools */}
        <Route path="/product-name-generator" component={ProductNameGenerator} />
        <Route path="/ad-copy-generator" component={AdCopyGenerator} />
        <Route path="/email-subject-line-generator" component={EmailSubjectLineGenerator} />
        <Route path="/cta-generator" component={CallToActionGenerator} />
        <Route path="/marketing-plan-generator" component={MarketingPlanGenerator} />
        <Route path="/content-calendar-generator" component={ContentCalendarGenerator} />
        <Route path="/product-description-generator" component={ProductDescriptionGenerator} />
        {/* Utility V2 */}
        <Route path="/qr-scanner" component={QrScanner} />
        <Route path="/barcode-generator" component={BarcodeGenerator} />
        <Route path="/barcode-scanner" component={BarcodeScanner} />
        <Route path="/signature-generator" component={SignatureGenerator} />
        <Route path="/digital-signature-creator" component={DigitalSignatureCreator} />
        <Route path="/invoice-number-generator" component={InvoiceNumberGenerator} />
        <Route path="/password-strength-checker" component={PasswordStrengthChecker} />
        <Route path="/file-checksum-generator" component={FileChecksumGenerator} />
        {/* Professional & Identity */}
        <Route path="/id-card-generator" component={IdCardGenerator} />
        <Route path="/email-signature-generator" component={EmailSignatureGenerator} />
        <Route path="/cover-letter-generator" component={CoverLetterGenerator} />
        <Route path="/passport-photo-maker" component={PassportPhotoMaker} />
        <Route path="/appointment-card-generator" component={AppointmentCardGenerator} />
        <Route path="/shipping-label-generator" component={ShippingLabelGenerator} />
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