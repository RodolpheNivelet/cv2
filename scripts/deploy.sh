set -e

git add -f -A
git commit -m "Travis build $TRAVIS_BUILD_NUMBER"
git push -fq origin gh-pages > /dev/null

echo "Done updating gh-pages"

else
 echo "Skipped updating gh-pages, because build is not triggered from the master branch."
fi;
