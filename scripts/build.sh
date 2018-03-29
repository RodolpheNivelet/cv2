set -e

if [[ $TRAVIS_BRANCH == "master" ]]; then

REPO=`git config remote.origin.url`

echo "Starting to update gh-pages"

cp -R dist $HOME/
cd $HOME
git config --global user.email "travis@travis-ci.org"
git config --global user.name "Travis"
git clone --quiet "https://${GH_TOKEN}@github.com/${TRAVIS_REPO_SLUG}.git" working-dir > /dev/null

cd working-dir

cp -Rf $HOME/dist/* .
