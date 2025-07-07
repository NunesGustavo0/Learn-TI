-- Cria o banco de dados se ele não existir
CREATE DATABASE IF NOT EXISTS `learn_ti` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Seleciona o banco de dados para uso
USE `learn_ti`;

-- Apaga as tabelas se elas já existirem, na ordem inversa de criação para evitar erros de chave estrangeira
-- Ordem: Tabelas de relacionamento/filhas primeiro, depois as tabelas principais
DROP TABLE IF EXISTS `resposta`;
DROP TABLE IF EXISTS `questao`;
DROP TABLE IF EXISTS `quiz`;
DROP TABLE IF EXISTS `nota`;
DROP TABLE IF EXISTS `boletim`;
DROP TABLE IF EXISTS `agenda`;
DROP TABLE IF EXISTS `cadastro`;
DROP TABLE IF EXISTS `flashcard`;
DROP TABLE IF EXISTS `documentacao`;
DROP TABLE IF EXISTS `disciplina`;
DROP TABLE IF EXISTS `usuario`;

-- Tabelas principais
CREATE TABLE `usuario`(
    `usucodigo` INT NOT NULL AUTO_INCREMENT,
    `usunome` VARCHAR(75) NOT NULL UNIQUE,
    `usuemail` VARCHAR(255) NOT NULL UNIQUE,
    `usutelefone` VARCHAR(20),
    `ususenha` VARCHAR(255) NOT NULL, -- Campo adicionado para a senha do usuário
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `pk_usuario` PRIMARY KEY (`usucodigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `disciplina`(
    `disccodigo` INT NOT NULL AUTO_INCREMENT,
    `discnome` VARCHAR(75) NOT NULL,
    `discdesc` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(100) NOT NULL UNIQUE, -- Campo adicionado para o slug da disciplina
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `pk_disciplina` PRIMARY KEY (`disccodigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabelas de relacionamento e conteúdo associadas ao usuário e disciplina
CREATE TABLE `agenda`(
    `agcodigo` INT NOT NULL AUTO_INCREMENT,
    `usucodigo` INT NOT NULL,
    `agtarefanome` VARCHAR(75) NOT NULL,
    `agtarefadesc` TEXT,
    `agtarefastatus` TINYINT(1) DEFAULT 0,
    `agtarefadata` DATETIME NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `pk_agenda` PRIMARY KEY (`agcodigo`),
    CONSTRAINT `fk_agenda_usuario` FOREIGN KEY (`usucodigo`)
        REFERENCES `usuario`(`usucodigo`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `boletim`(
    `bocodigo` INT NOT NULL AUTO_INCREMENT,
    `usucodigo` INT NOT NULL,
    `disccodigo` INT NOT NULL,
    `bonome` VARCHAR(75) NOT NULL,
    `boano` INT NOT NULL, -- Campo adicionado para o ano do boletim
    `bosemestre` TINYINT(1) NOT NULL, -- Campo adicionado para o semestre (1 ou 2)
    `n1` DECIMAL(4, 2) NULL, -- Nota 1 (pode ser nula se ainda não lançada)
    `n2` DECIMAL(4, 2) NULL, -- Nota 2 (pode ser nula se ainda não lançada)
    `n3` DECIMAL(4, 2) NULL, -- Nota 3 (pode ser nula se ainda não lançada)
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `pk_boletim` PRIMARY KEY (`bocodigo`),
    CONSTRAINT `fk_boletim_usuario` FOREIGN KEY (`usucodigo`)
        REFERENCES `usuario`(`usucodigo`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT `fk_boletim_disciplina` FOREIGN KEY (`disccodigo`)
        REFERENCES `disciplina`(`disccodigo`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    -- Chave única para garantir que um usuário tenha apenas um boletim por disciplina, ano e semestre
    UNIQUE KEY `uk_boletim_usuario_disciplina_ano_semestre` (`usucodigo`, `disccodigo`, `boano`, `bosemestre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `nota`(
    `notcodigo` INT NOT NULL AUTO_INCREMENT,
    `bocodigo` INT NOT NULL,
    `notavalor` DECIMAL(4, 2) NOT NULL CHECK (`notavalor` >= 0 AND `notavalor` <= 10),
    `notadesc` VARCHAR(75),
    `data_avaliacao` DATE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `pk_nota` PRIMARY KEY (`notcodigo`),
    CONSTRAINT `fk_nota_boletim` FOREIGN KEY (`bocodigo`)
        REFERENCES `boletim`(`bocodigo`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cadastro`(
    `usucodigo` INT NOT NULL,
    `disccodigo` INT NOT NULL,
    `data_cadastro` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `status` TINYINT(1) DEFAULT 1,
    CONSTRAINT `pk_cadastro` PRIMARY KEY (`usucodigo`, `disccodigo`),
    CONSTRAINT `fk_cadastro_usuario` FOREIGN KEY (`usucodigo`)
        REFERENCES `usuario`(`usucodigo`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT `fk_cadastro_disciplina` FOREIGN KEY (`disccodigo`)
        REFERENCES `disciplina`(`disccodigo`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `flashcard`(
    `fccodigo` INT NOT NULL AUTO_INCREMENT,
    `disccodigo` INT NOT NULL,
    `fcfrente` TEXT NOT NULL,
    `fcverso` TEXT NOT NULL,
    `dificuldade` TINYINT DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `pk_flashcard` PRIMARY KEY (`fccodigo`),
    CONSTRAINT `fk_flashcard_disciplina` FOREIGN KEY (`disccodigo`)
        REFERENCES `disciplina`(`disccodigo`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `documentacao`(
    `doccodigo` INT NOT NULL AUTO_INCREMENT,
    `disccodigo` INT NOT NULL,
    `doctitulo` VARCHAR(75) NOT NULL,
    `docdesc` TEXT,
    `doclink` VARCHAR(2048),
    `tipo_documento` VARCHAR(50),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `pk_documentacao` PRIMARY KEY (`doccodigo`),
    CONSTRAINT `fk_documentacao_disciplina` FOREIGN KEY (`disccodigo`)
        REFERENCES `disciplina`(`disccodigo`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabelas de Quiz (esquema básico, pois não foram fornecidas no CREATE TABLE original)
CREATE TABLE `quiz`(
    `quizcodigo` INT NOT NULL AUTO_INCREMENT,
    `disccodigo` INT NOT NULL,
    `quiznome` VARCHAR(100) NOT NULL,
    `quizdesc` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `pk_quiz` PRIMARY KEY (`quizcodigo`),
    CONSTRAINT `fk_quiz_disciplina` FOREIGN KEY (`disccodigo`)
        REFERENCES `disciplina`(`disccodigo`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `questao`(
    `queccodigo` INT NOT NULL AUTO_INCREMENT,
    `quizcodigo` INT NOT NULL,
    `quetexto` TEXT NOT NULL,
    `quetipo` VARCHAR(50) DEFAULT 'multipla_escolha', -- Ex: 'multipla_escolha', 'verdadeiro_falso', 'aberta'
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `pk_questao` PRIMARY KEY (`queccodigo`),
    CONSTRAINT `fk_questao_quiz` FOREIGN KEY (`quizcodigo`)
        REFERENCES `quiz`(`quizcodigo`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `resposta`(
    `respcodigo` INT NOT NULL AUTO_INCREMENT,
    `queccodigo` INT NOT NULL,
    `resptexto` TEXT NOT NULL,
    `respcorreta` TINYINT(1) DEFAULT 0, -- 1 para resposta correta, 0 para incorreta
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `pk_resposta` PRIMARY KEY (`respcodigo`),
    CONSTRAINT `fk_resposta_questao` FOREIGN KEY (`queccodigo`)
        REFERENCES `questao`(`queccodigo`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
