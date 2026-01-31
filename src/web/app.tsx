import { Route, Switch } from "wouter";
import Index from "./pages/index";
import Dashboard from "./pages/dashboard";
import BalanceSheet from "./pages/balance-sheet";
import BalanceSheetLevel1 from "./pages/balance-sheet-level-1";
import BalanceSheetLevel1Quiz from "./pages/balance-sheet-level-1-quiz";
import BalanceSheetLevel1Complete from "./pages/balance-sheet-level-1-complete";
import ColdCall from "./pages/cold-call";
import ColdCallBriefing from "./pages/cold-call-briefing";
import ColdCallSession from "./pages/cold-call-session";
import ColdCallFeedback from "./pages/cold-call-feedback";
import RCA from "./pages/rca";
import RCAInvestigation from "./pages/rca-investigation";
import RCAFeedback from "./pages/rca-feedback";
import { Provider } from "./components/provider";

function App() {
	return (
		<Provider>
			<Switch>
				<Route path="/" component={Index} />
				<Route path="/dashboard" component={Dashboard} />
				<Route path="/balance-sheet" component={BalanceSheet} />
				<Route path="/balance-sheet/level/1" component={BalanceSheetLevel1} />
				<Route path="/balance-sheet/level/1/quiz" component={BalanceSheetLevel1Quiz} />
				<Route path="/balance-sheet/level/1/complete" component={BalanceSheetLevel1Complete} />
				{/* Cold Call Hero routes */}
				<Route path="/cold-call" component={ColdCall} />
				<Route path="/cold-call/:scenarioId/briefing" component={ColdCallBriefing} />
				<Route path="/cold-call/:scenarioId/call" component={ColdCallSession} />
				<Route path="/cold-call/:scenarioId/feedback" component={ColdCallFeedback} />
				{/* RCA Detective routes */}
				<Route path="/rca" component={RCA} />
				<Route path="/rca/:caseId" component={RCAInvestigation} />
				<Route path="/rca/:caseId/feedback" component={RCAFeedback} />
			</Switch>
		</Provider>
	);
}

export default App;
