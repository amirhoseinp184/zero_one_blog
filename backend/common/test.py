# Source - https://stackoverflow.com/a
# Posted by Dustin Gault, modified by community. See post 'Timeline' for change history
# Retrieved 2025-11-16, License - CC BY-SA 4.0

from django.db import connection
from django.db.models.base import ModelBase
from django.db.utils import OperationalError
from django.test import TestCase


class AbstractModelMixinTestCase(TestCase):
    """
    Base class for tests of model mixins/abstract models.
    To use, subclass and specify the mixin class variable.
    A model using the mixin will be made available in self.model
    """
    @classmethod
    def setUpClass(cls):
        # Create a dummy model which extends the mixin. A RuntimeWarning will
        # occur if the model is registered twice
        if not hasattr(cls, "model"):
            cls.model = ModelBase(
                "__TestModel__" + cls.mixin.__name__,
                (cls.mixin,),
                {"__module__": cls.mixin.__module__},
            )

        # Create the schema for our test model. If the table already exists,
        # will pass
        try:
            with connection.schema_editor() as schema_editor:
                schema_editor.create_model(cls.model)
        except OperationalError:
            pass

        super(AbstractModelMixinTestCase, cls).setUpClass()


    @classmethod
    def tearDownClass(self):
        super(AbstractModelMixinTestCase, self).tearDownClass()
        # Delete the schema for the test model. If no table, will pass
        try:
            with connection.schema_editor() as schema_editor:
                schema_editor.delete_model(self.model)
        except OperationalError:
            pass
