import { Route, Switch } from "wouter";
import Index from "./pages/index";
import Dashboard from "./pages/dashboard";
import BalanceSheet from "./pages/balance-sheet";
import BalanceSheetLevel1 from "./pages/balance-sheet-level-1";
import BalanceSheetLevel1Quiz from "./pages/balance-sheet-level-1-quiz";
import BalanceSheetLevel1Complete from "./pages/balance-sheet-level-1-complete";
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
			</Switch>
		</Provider>
	);
}

export default App;
