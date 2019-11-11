module.exports = {
	apps: [{
		name   : "cliksource-app",
	    script : "./server.js",
	    instances : "max",
	    exec_mode	 : "cluster",
	    out_file : "../logs/output.log",
	    error_file: "../logs/output.log",
	    merge_logs: true,
	    log_date_format: "YYYY-MM-DD HH:mm Z",
	    env: {
	      "NODE_ENV": "development",
	    },
	    env_production : {
	       "NODE_ENV": "production",
	       "PORT": "9000",
	       "IP": "0.0.0.0"
	    }
	}]
}