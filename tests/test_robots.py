import unittest
import urllib.robotparser
from pathlib import Path


REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
TEAM_URL = "https://gabrygao.github.io/web-Li/team/"
SITE_URL = "https://gabrygao.github.io/web-Li/"


class RobotsRulesTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.parser = urllib.robotparser.RobotFileParser()
        robots_path = REPOSITORY_ROOT / "robots.txt"
        rules = robots_path.read_text().splitlines() if robots_path.exists() else []
        cls.parser.parse(rules)

    def test_archive_crawlers_are_excluded_from_team_page(self):
        for user_agent in ("archive.org_bot", "ia_archiver", "Archive-It"):
            with self.subTest(user_agent=user_agent):
                self.assertFalse(self.parser.can_fetch(user_agent, TEAM_URL))

    def test_googlebot_can_still_crawl_team_page(self):
        self.assertTrue(self.parser.can_fetch("Googlebot", TEAM_URL))

    def test_archive_crawlers_can_still_crawl_other_site_pages(self):
        self.assertTrue(self.parser.can_fetch("archive.org_bot", SITE_URL))


if __name__ == "__main__":
    unittest.main()
