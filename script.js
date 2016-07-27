var app = angular.module("noobApp", ["ngRoute", "firebase"])

app.config(function($routeProvider) {
	$routeProvider.when('/', {
		controller: "MainCtrl",
		templateUrl: "templates/home.html",
		resolve: {
			"currentAuth": function($firebaseAuth) {
				return $firebaseAuth().$requireSignIn();
			}
		}
	}).when('/signup', {
		controller: "SignUpCtrl",
		templateUrl: "templates/signup.html"
	}).when('/login', {
		controller: "LogInCtrl",
		templateUrl: "templates/login.html"
	})
	// $routeProvider.when('/user/:userId', {
	// 	controller: "BoardCtrl",
	// 	templateUrl: "templates/home.html",
	// 	resolve: {
	// 		"currentAuth": function($firebaseAuth) {
	// 			return $firebaseAuth().$requireSignIn();
	// 		}
	// 	}
	// })
});

app.run(["$rootScope", "$location", function($rootScope, $location) {
 $rootScope.$on("$routeChangeError", function(event, next, previous, error) {
   // We can catch the error thrown when the $requireSignIn promise is rejected
   // and redirect the user back to the home page
   if (error === "AUTH_REQUIRED") {
     $location.path("/login");
   }
 });
}]);

app.controller("MainCtrl", function($scope, $http, $firebaseArray, $firebaseObject, $firebaseAuth, $location, $routeParams, $route, currentAuth){
	$scope.authObj = $firebaseAuth();

	$scope.usersId = currentAuth.uid;
	console.log($scope.usersId);
	
	//store noob points in board
	var noobRef = firebase.database().ref().child("board").child($scope.usersId).child("noobCount");
	$scope.noobPt = $firebaseArray(noobRef);
	console.log($scope.noobPt);

	//store assassin points in board
	var assnRef = firebase.database().ref().child("board").child($scope.usersId).child("assnCount");
	$scope.assnPt = $firebaseArray(assnRef);
	
	console.log($scope.assnPt);
	//get users info in MainCtrl
	var userRef = firebase.database().ref().child("users");
	$scope.users = $firebaseObject(userRef);

	//add noob points
	$scope.addNoobPt = function() {
		// //loop through array, incrementing count by 1
		// for(var i = 0; i < $scope.noobPt.length; i++) {
		// 	console.log("in the for loop");
		// 	if ($scope.noobPt[i].count === NaN) {
		// 		$scope.noobPt[i].count = 0;
		// 	}
		// 	else {
		// 		$scope.noobPt[i].count = $scope.noobPt[i - 1].count + 1;	
		// 	}
		// };
		// console.log($scope.noobPt[i].count)

		console.log("I'm running");
		$scope.noobPt.$add ({
			count: $scope.noobPt[0].count,
			sender: $scope.usersId,
			created_at: Date.now()
		});
		

		//simple counter
		//$scope.noobPt = $scope.noobPt + 1;
		//console.log($scope.noobPt);
	}
	//add assassin points
	$scope.assnPt = 0;
	$scope.addAssnPt = function() {
		$scope.assnPt = $scope.assnPt + 1;
		console.log($scope.users.points);
	}







	//sign out f(x)
	$scope.signOut= function(){
    	$scope.authObj.$signOut();
    	$location.path("/login")
    };
});



app.controller("SignUpCtrl", function($scope, $http, $route, $firebaseObject, $firebaseArray,$routeParams,$firebaseAuth, $location) {
	$scope.authObj = $firebaseAuth();

	//function to sign up
	$scope.signUp = function() {
		console.log($scope.name + " " + $scope.email + " " + $scope.password + " " + $scope.points);


		console.log($scope.authObj);
		$scope.authObj.$createUserWithEmailAndPassword($scope.email, $scope.password)
		.then(function(firebaseUser) {
			// $scope.points = {
			// 	'$scope.noobPt': 0,
			// 	'$scope.assnPt': 0,
			// };
			// console.log($scope.points);
			console.log(firebaseUser.uid + " created successfully!");
			var userRef = firebase.database().ref().child("users").child(firebaseUser.uid);

			// $scope.points = {
			// 	'$scope.noobPt': 0,
			// 	'$scope.assnPt': 0,
			// };
			// console.log($scope.points);

			$scope.users = $firebaseObject(userRef);
			$scope.points = {
				'$scope.noobPt': 0,
				'$scope.assnPt': 0,
			};
			console.log($scope.points);
			$scope.users.name = $scope.name;
			$scope.users.email = $scope.email;
			$scope.users.password = $scope.password;
			$scope.users.points = $scope.points;
			console.log($scope.users.points);
			$scope.users.$save();
			$scope.users.points.$save();

			console.log($scope.users);

			$location.path('/');
			
		}).catch(function(error) {
			console.error("Error: ", error);
		});
	};
});

app.controller("LogInCtrl", function($scope, $http, $route, $firebaseObject, $firebaseArray, $routeParams, $firebaseAuth, $location) {
	$scope.authObj = $firebaseAuth();

    $scope.login = function() {
        console.log($scope.email);
        console.log($scope.password);

        $scope.authObj.$signInWithEmailAndPassword($scope.email, $scope.password)
        .then(function(firebaseUser) {
            console.log("Signed in as:", firebaseUser.uid);
            $location.path('/');

        }).catch(function(error) {
             console.error("Error: ", error);
        })

    }
});










