var http = require('http');
var http = require('follow-redirects').http;
var read_line = require('readline');
var exec = require('child_process').exec;
var user = ''

//Check input arguments
if (process.argv.length == 3){
    user = process.argv[2]
} else if(process.argv.length > 3) {
    console.log('Please Check Input Arguments');
    process.exit(1);
}

// Setting up readline
const rl = read_line.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('Getting from '+ user +  's github')


var options = {
    host: 'api.github.com',
    path: '/users/' + user + '/repos',
    headers: {
        'User-Agent': user
    }
};

request = function(response, callback) {
    var data = '';
    //Store data
    response.on('data', function (chunk) {
        data += chunk;
    });
    //Use data
    response.on('end', function () {
        var json_data = JSON.parse(data);
        var all_repo_urls =[]
        for(i = 0; i < json_data.length; i++) {
            var split_string = json_data[i].url.split('api.')
            var combined_split = split_string[0] + split_string[1];
            split_string = combined_split.split('repos/');
            combined_split = split_string[0] + split_string[1]
            all_repo_urls.push(combined_split)
        }


        for (i = 0; i < all_repo_urls.length; i++){
            var project_name = all_repo_urls[i].split('/')
            project_name = project_name[project_name.length-1]
            console.log(i + ": " +  project_name);
        }
        rl.question('Which repo do you want to clone (type the number!): \n', function (answer) {
            var repo = all_repo_urls[answer];
            if (repo) {
                exec('git clone ' + repo, function (err, stdout, stderr) {
                    if (err) {
                        console.log('Got error: ' + err)
                        process.exit(1)
                    }
                    console.log('Cloning: ' + repo)
                    process.exit(0)
                });
            } else {
                console.log('Could not load find repository')
                process.exit(0)
            }
        })

    });
}

http.request(options, request).end();
