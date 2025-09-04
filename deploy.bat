@echo off
REM Скрипт для сборки и деплоя проекта на GitHub Pages

echo Начинаем сборку проекта...

REM Очищаем директорию dist
npm run clean

REM Запускаем сборку проекта
npm run build

echo Сборка завершена успешно!

echo Подготовка к публикации на GitHub Pages...

REM Копируем собранные файлы в корневую директорию для GitHub Pages
xcopy dist\* . /E /Y

echo Файлы скопированы. Готово к коммиту и публикации!