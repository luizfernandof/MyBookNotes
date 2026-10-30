package br.com.devl.mybooknotes;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

@SpringBootTest
@Import(TestcontainersConfig.class)
class MybooknotesApplicationTests {

	@Test
	void contextLoads() {
	}

}
